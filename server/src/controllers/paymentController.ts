import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Fee from '../models/Fee';
import PaymentLog from '../models/PaymentLog';
import AuditLog from '../models/AuditLog';
import User from '../models/User';
import { generateFeeReceipt } from '../utils/pdfGenerator';
import Warden from '../models/Warden';

import Razorpay from 'razorpay';

/**
 * @desc    Create a Razorpay payment order
 * @route   POST /api/payments/create-order
 * @access  Private/Student
 */
export const createOrder = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const studentId = (req as any).user?._id;
    const { feeId, amountToPay } = req.body; 

    if (!studentId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const fee = await Fee.findOne({ _id: feeId, student: studentId, status: { $ne: 'PAID' } });

    if (!fee) {
        res.status(404);
        throw new Error('Specific fee record not found or already paid');
    }

    const payableAmount = amountToPay || fee.balanceAmount;
    if (payableAmount > fee.balanceAmount) {
        res.status(400);
        throw new Error('Amount exceeds balance due');
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID as string,
        key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const options = {
        amount: Math.round(payableAmount * 100), // Razorpay expects paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${feeId.toString().slice(-6)}`,
        notes: {
            feeId: feeId.toString(),
            studentId: studentId.toString(),
            feeType: fee.type
        }
    };

    try {
        const order = await razorpay.orders.create(options);
        
        const user = await User.findById(studentId);

        res.status(201).json({
            success: true,
            razorpayOrder: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
                name: 'SHAMS Hostel',
                description: `${fee.type} Payment`,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.profile?.phone || '9999999999'
                }
            },
            isSimulation: false
        });
    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        res.status(500);
        throw new Error(error.message || 'Failed to initiate Razorpay order');
    }
}) as any);

/**
 * @desc    Record a payment (Internal Helper)
 */
const recordPayment = async (feeId: any, amount: number, mode: 'ONLINE' | 'OFFLINE', reference?: string) => {
    const fee = await Fee.findById(feeId);
    if (!fee) return null;

    fee.paidAmount += amount;
    fee.balanceAmount = fee.totalAmount + fee.lateFee - fee.paidAmount;
    
    if (fee.balanceAmount <= 0) {
        fee.status = 'PAID';
        fee.balanceAmount = 0;
    } else {
        fee.status = 'PARTIAL';
    }

    fee.paymentMode = mode;
    fee.lastPaymentAt = new Date();
    if (reference) fee.receiptNumber = reference;

    await fee.save();

    await PaymentLog.create({
        feeId: fee._id,
        studentId: fee.student,
        transactionId: reference || `TXN_${Date.now()}`,
        status: 'success',
        amount: amount,
        paymentMode: mode
    });

    return fee;
};

/**
 * @desc    Admin offline payment update
 * @route   POST /api/payments/offline-pay
 * @access  Private/Admin
 */
export const markOfflinePaid = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId, amount, receiptNumber } = req.body;

    if (!amount || !receiptNumber) {
        res.status(400);
        throw new Error('Amount and Receipt number are required');
    }

    const fee = await recordPayment(feeId, amount, 'OFFLINE', receiptNumber);

    if (!fee) {
        res.status(404);
        throw new Error('Fee record not found');
    }

    await AuditLog.create({
        admin: (req as any).user?._id,
        action: 'MARK_FEE_PAID_OFFLINE',
        targetId: fee._id,
        details: `Amount: ${amount}, Receipt: ${receiptNumber}`,
        ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Offline payment recorded and synced', fee });
}) as any);

/**
 * @desc    Get current student's fee summary
 * @route   GET /api/payments/my-fee
 * @access  Private/Student
 */
export const getMyFee = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fees = await Fee.find({ student: (req as any).user?._id }).sort({ createdAt: -1 });
    res.json(fees);
    return;
}) as any);

/**
 * @desc    Get all fees for Admin/Chief Warden
 * @route   GET /api/payments/all
 * @access  Private/Admin/ChiefWarden
 */
export const getAllFees = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fees = await Fee.find().populate('student', 'name email profile.studentId').sort({ createdAt: -1 });
    res.json(fees);
    return;
}) as any);

/**
 * @desc    Create a new fee invoice
 * @route   POST /api/payments/create
 * @access  Private/Admin
 */
export const adminCreateFee = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { studentId, totalAmount, dueDate } = req.body;

    if (!totalAmount || isNaN(totalAmount)) {
        res.status(400);
        throw new Error('Valid total amount is required');
    }

    const fee = await Fee.create({
        student: studentId,
        totalAmount,
        balanceAmount: totalAmount,
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        status: 'PENDING'
    });

    res.status(201).json({ success: true, fee });
    return;
}) as any);

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private/Student
 */
export const verifyPayment = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        feeId,
        amount
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Success
        const fee = await recordPayment(feeId, amount, 'ONLINE', razorpay_payment_id);
        res.json({ success: true, message: 'Payment verified and recorded', fee });
    } else {
        res.status(400);
        throw new Error('Invalid payment signature. Potential tampering detected.');
    }
}) as any);

/**
 * @desc    Simulate success (Dev only)
 */
export const simulateSuccess = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId, amount } = req.body;
    const fee = await recordPayment(feeId, amount, 'ONLINE', `SIM_${Math.random().toString(36).substring(7)}`);
    res.json({ success: true, message: 'Payment simulated and synced', fee });
}) as any);

/**
 * @desc    Download Fee Receipt PDF
 * @route   GET /api/payments/receipt/:feeId
 * @access  Private
 */
export const downloadReceipt = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId } = req.params;
    const fee = await Fee.findById(feeId);

    if (!fee) {
        res.status(404);
        throw new Error('Fee record not found');
    }

    const userId = (req as any).user?._id;
    const userRole = (req as any).user?.role;

    if (userRole === 'student' && fee.student.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this receipt');
    }

    const student = await User.findById(fee.student);
    if (!student) {
        res.status(404);
        throw new Error('Student associated with this fee not found');
    }

    generateFeeReceipt(res, fee, student);
}) as any);
