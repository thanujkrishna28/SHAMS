import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Fee from '../models/Fee';
import PaymentLog from '../models/PaymentLog';
import AuditLog from '../models/AuditLog';
import User from '../models/User';

/**
 * @desc    Create a PayU payment order/hash
 * @route   POST /api/payments/create-order
 * @access  Private/Student
 */
export const createOrder = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const studentId = (req as any).user?._id;

    if (!studentId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Fetch pending fee for the student
    const fee = await Fee.findOne({ student: studentId, status: 'PENDING' });

    if (!fee) {
        res.status(404);
        throw new Error('No pending fee found for this student');
    }

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;
    const isPlaceholder = !merchantKey || merchantKey.includes('YourKey') || merchantKey.includes('placeholder');

    if (isPlaceholder) {
        // SIMULATION MODE: Redirect to a local simulator because keys are missing
        console.log('🚧 SIMULATION MODE: No real PayU keys, redirecting to local simulator');

        // Save a dummy order ID
        fee.gatewayOrderId = `simp_${Math.random().toString(36).substring(7)}`;
        fee.paymentMode = 'ONLINE';
        await fee.save();

        res.status(201).json({
            success: true,
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-simulator?feeId=${fee._id}&amount=${fee.totalAmount}`,
            orderId: fee.gatewayOrderId,
            isSimulation: true
        });
        return;
    }

    try {
        // PayU Params
        const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const amount = fee.totalAmount.toFixed(2);
        const productinfo = `Hostel Fee Payment for Fee ID: ${fee._id}`;
        const firstname = (req as any).user?.name || 'Student';
        const email = (req as any).user?.email || '';
        const phone = (req as any).user?.profile?.phone || '';

        // Hash Formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
        const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        // Save transaction ID as gatewayOrderId
        fee.gatewayOrderId = txnid;
        fee.paymentMode = 'ONLINE';
        await fee.save();

        res.status(201).json({
            success: true,
            payuData: {
                key: merchantKey,
                txnid: txnid,
                amount: amount,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-processing?feeId=${fee._id}&status=success`,
                furl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-processing?feeId=${fee._id}&status=failure`,
                hash: hash,
                service_provider: 'payu_paisa'
            },
            isSimulation: false
        });
        return;
    } catch (error: any) {
        console.error('PayU Error:', error);
        res.status(500);
        throw new Error(error.message || 'Failed to initiate PayU payment');
    }
}) as any);





/**
 * @desc    PayU Status/Webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public
 */
export const handleWebhook = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // PayU sends the status in the post body
    const { status, txnid, hash, key, amount, productinfo, firstname, email, unmappedstatus } = req.body;
    const salt = process.env.PAYU_SALT;

    // Verify Reverse Hash: salt|status||||||udf10...udf1|email|firstname|productinfo|amount|txnid|key
    const reverseHashString = `${salt}|${status}||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    if (hash !== expectedHash) {
        console.error('❌ PayU Hash Mismatch');
        res.status(400);
        throw new Error('Invalid payment hash');
    }

    // Find the fee by transaction ID
    const fee = await Fee.findOne({ gatewayOrderId: txnid });

    if (fee) {
        await PaymentLog.create({
            feeId: fee._id,
            studentId: fee.student,
            gatewayOrderId: txnid,
            transactionId: req.body.payuMoneyId || txnid,
            status: status,
            rawPayload: req.body,
        });

        if (status === 'success' && fee.status !== 'PAID') {
            fee.status = 'PAID';
            fee.transactionId = req.body.payuMoneyId || txnid;
            fee.paidAt = new Date();
            await fee.save();
            console.log(`✅ Fee ${fee._id} marked as PAID via PayU Webhook`);
        } else if (status === 'failure') {
            fee.status = 'FAILED';
            await fee.save();
        }
    }

    res.status(200).json({ status: 'ok' });
    return;
}) as any);


/**
 * @desc    Get fee status for polling
 * @route   GET /api/fees/status/:feeId
 * @access  Private/Student
 */
export const getFeeStatus = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId } = req.params;
    const fee = await Fee.findById(feeId);

    if (!fee) {
        res.status(404);
        throw new Error('Fee not found');
    }

    // Security: Ensure the student can only check their own fee status
    const user = (req as any).user;
    if (fee.student.toString() !== user?._id.toString() && user?.role === 'student') {
        res.status(403);
        throw new Error('Not authorized to view this fee status');
    }

    res.json({
        success: true,
        status: fee.status,
        feeId: fee._id,
    });
    return;
}) as any);


/**
 * @desc    Admin offline payment update
 * @route   POST /api/payments/offline-pay
 * @access  Private/Admin
 */
export const markOfflinePaid = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId, receiptNumber } = req.body;

    if (!receiptNumber) {
        res.status(400);
        throw new Error('Receipt number is required for offline payments');
    }

    const fee = await Fee.findById(feeId);

    if (!fee) {
        res.status(404);
        throw new Error('Fee not found');
    }

    if (fee.status === 'PAID') {
        res.status(400);
        throw new Error('Fee is already paid');
    }

    fee.status = 'PAID';
    fee.paymentMode = 'OFFLINE';
    fee.receiptNumber = receiptNumber;
    fee.paidAt = new Date();
    await fee.save();

    // Log in AuditLog
    await AuditLog.create({
        admin: (req as any).user?._id,
        action: 'MARK_FEE_PAID_OFFLINE',
        targetId: fee._id,
        targetModel: 'Fee',
        details: `Receipt Number: ${receiptNumber}`,
        ipAddress: req.ip,
    });

    res.json({
        success: true,
        message: 'Fee marked as paid (offline)',
        fee,
    });
    return;
}) as any);


/**
 * @desc    Get current student's fee
 * @route   GET /api/payments/my-fee
 * @access  Private/Student
 */
export const getMyFee = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fee = await Fee.findOne({ student: (req as any).user?._id }).sort({ createdAt: -1 });
    res.json(fee);
    return;
}) as any);


/**
 * @desc    Get all fees
 * @route   GET /api/payments/all
 * @access  Private/Admin
 */
export const getAllFees = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fees = await Fee.find().populate('student', 'name email profile.studentId').sort({ createdAt: -1 });
    res.json(fees);
    return;
}) as any);


/**
 * @desc    Create a new fee record (Single or Bulk)
 * @route   POST /api/payments/create
 * @access  Private/Admin
 */
export const adminCreateFee = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { studentId, totalAmount } = req.body;

    if (!totalAmount || isNaN(totalAmount)) {
        res.status(400);
        throw new Error('Valid total amount is required');
    }

    if (studentId === 'ALL') {
        const students = await User.find({ role: 'student', isActive: true });

        const createdFees = [];
        for (const student of students) {
            const existingFee = await Fee.findOne({ student: student._id, status: 'PENDING' });
            if (!existingFee) {
                const fee = await Fee.create({
                    student: student._id,
                    totalAmount,
                    status: 'PENDING'
                });
                createdFees.push(fee);
            }
        }

        res.status(201).json({
            success: true,
            count: createdFees.length,
            message: `Created fees for ${createdFees.length} students.`
        });
        return;
    } else {
        const student = await User.findById(studentId);
        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        const existingFee = await Fee.findOne({ student: student._id, status: 'PENDING' });
        if (existingFee) {
            res.status(400);
            throw new Error('Student already has a pending fee.');
        }

        const fee = await Fee.create({
            student: student._id,
            totalAmount,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, fee });
        return;
    }
}) as any);


/**
 * @desc    Simulate payment success (Dev only)
 * @route   POST /api/payments/simulate-success
 * @access  Private/Student
 */
export const simulateSuccess = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { feeId } = req.body;

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const isPlaceholder = !merchantKey || merchantKey.includes('YourKey') || merchantKey.includes('placeholder');

    if (!isPlaceholder && process.env.NODE_ENV === 'production') {
        res.status(403);
        throw new Error('Simulation not allowed in production with real keys');
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
        res.status(404);
        throw new Error('Fee not found');
    }

    fee.status = 'PAID';
    fee.transactionId = `sim_tx_${Math.random().toString(36).substring(7)}`;
    fee.paidAt = new Date();
    await fee.save();

    res.json({ success: true, message: 'Payment simulated successfully' });
    return;
}) as any);


/**
 * @desc    Verify PayU payment signature (Frontend Sync)
 * @route   POST /api/payments/verify
 * @access  Private/Student
 */
export const verifyPayment = asyncHandler((async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status, txnid, hash, key, amount, productinfo, firstname, email, feeId } = req.body;
    const salt = process.env.PAYU_SALT;

    // Verify Reverse Hash: salt|status||||||udf10...udf1|email|firstname|productinfo|amount|txnid|key
    const reverseHashString = `${salt}|${status}||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    if (hash !== expectedHash) {
        res.status(400);
        throw new Error('Invalid payment verification signature');
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
        res.status(404);
        throw new Error('Fee not found');
    }

    if (status === 'success' && fee.status !== 'PAID') {
        fee.status = 'PAID';
        fee.transactionId = req.body.payuMoneyId || txnid;
        fee.paidAt = new Date();
        await fee.save();
    }

    res.json({ success: true, message: 'Payment verified successfully' });
    return;
}) as any);






