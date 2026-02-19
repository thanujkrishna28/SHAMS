import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Fee from '../models/Fee';
import { createNotification } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Get student's fees
// @route   GET /api/fees/my
// @access  Private (Student)
export const getMyFees = asyncHandler(async (req: any, res: Response) => {
    const fees = await Fee.find({ student: req.user._id }).sort({ dueDate: 1 });
    res.json(fees);
});

// @desc    Get all fees (for admin)
// @route   GET /api/fees
// @access  Private (Admin)
export const getAllFees = asyncHandler(async (req: Request, res: Response) => {
    const fees = await Fee.find({}).populate('student', 'name email profile.studentId');
    res.json(fees);
});

// @desc    Create a fee (for admin)
// @route   POST /api/fees
// @access  Private (Admin)
export const createFee = asyncHandler(async (req: any, res: Response) => {
    const { studentId, title, amount, dueDate, type, description } = req.body;

    const fee = await Fee.create({
        student: studentId,
        title,
        amount,
        dueDate,
        type,
        description
    });

    await createNotification(
        studentId,
        'New Fee Due',
        `A new fee "${title}" of amount ₹${amount} has been added. Due date: ${new Date(dueDate).toLocaleDateString()}`,
        'info'
    );

    res.status(201).json(fee);
});

// @desc    Update fee payment (Simulated)
// @route   PUT /api/fees/:id/pay
// @access  Private (Student/Admin)
export const markFeePaid = asyncHandler(async (req: any, res: Response) => {
    const { transactionId, paymentMethod, amountPaid } = req.body;
    const fee = await Fee.findById(req.params.id);

    if (fee) {
        fee.amountPaid += amountPaid;
        fee.status = fee.amountPaid >= fee.amount ? 'paid' : 'partially_paid';

        fee.transactionHistory.push({
            amount: amountPaid,
            date: new Date(),
            transactionId: transactionId || `TXN${Date.now()}`,
            paymentMethod: paymentMethod || 'online'
        });

        await fee.save();

        await createNotification(
            fee.student.toString(),
            'Payment Received',
            `Payment of ₹${amountPaid} for "${fee.title}" has been confirmed.`,
            'success'
        );

        // Audit Log
        try {
            await logAudit(
                (req as any).user._id,
                'FEE_PAYMENT',
                fee._id.toString(),
                'Fee',
                `Payment of ₹${amountPaid} recorded for ${fee.title}`,
                req.ip || req.socket.remoteAddress || ''
            );
        } catch (err) { console.error("Audit log failed", err) }

        res.json(fee);
    } else {
        res.status(404);
        throw new Error('Fee not found');
    }
});
