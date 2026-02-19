import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Leave from '../models/Leave';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Student)
export const applyLeave = asyncHandler(async (req: any, res: Response) => {
    const { startDate, endDate, reason, type } = req.body;

    const leave = await Leave.create({
        student: req.user._id,
        startDate,
        endDate,
        reason,
        type: type || 'personal',
        status: 'pending'
    });

    await notifyAdmins(
        'New Leave Request',
        `Student ${req.user.name} applied for leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        'info'
    );

    res.status(201).json(leave);
});

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private (Student)
export const getMyLeaves = asyncHandler(async (req: any, res: Response) => {
    const leaves = await Leave.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
});

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private (Admin)
export const getAllLeaves = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { status, type } = req.query;
    let query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
        .populate('student', 'name email profile.studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        data: leaves,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private (Admin)
export const updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, adminComment } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (leave) {
        leave.status = status;
        leave.adminComment = adminComment;
        await leave.save();

        await createNotification(
            leave.student.toString(),
            `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
            status === 'approved' ? 'success' : 'warning'
        );

        // Audit Log
        try {
            await logAudit(
                (req as any).user._id,
                `LEAVE_${status.toUpperCase()}`,
                leave._id.toString(),
                'Leave',
                `Status updated to ${status}.${adminComment ? ` Comment: ${adminComment}` : ''}`,
                req.ip || req.socket.remoteAddress || ''
            );
        } catch (err) { console.error("Audit log failed", err) }

        res.json(leave);
    } else {
        res.status(404);
        throw new Error('Leave request not found');
    }
});
