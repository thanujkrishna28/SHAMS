import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = asyncHandler(async (req: any, res: Response) => {
    const { title, description, category } = req.body;

    const complaint = await Complaint.create({
        student: req.user._id,
        title,
        description,
        category: category || 'maintenance',
        status: 'pending'
    });

    await notifyAdmins(
        'New Complaint Received',
        `Student ${req.user.name} submitted a new complaint: ${title}`,
        'warning'
    );

    res.status(201).json(complaint);
});

// @desc    Get my complaints
// @route   GET /api/complaints/my
// @access  Private (Student)
export const getMyComplaints = asyncHandler(async (req: any, res: Response) => {
    const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
});

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin)
export const getAllComplaints = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { status, category } = req.query;
    let query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
        .populate('student', 'name email profile.studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        data: complaints,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
export const updateComplaintStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, adminComment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
        complaint.status = status;
        complaint.adminComment = adminComment;
        await complaint.save();

        await createNotification(
            complaint.student.toString(),
            `Complaint ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your complaint "${complaint.title}" has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
            status === 'resolved' ? 'success' : 'info'
        );

        // Audit Log
        try {
            await logAudit(
                (req as any).user._id,
                `COMPLAINT_${status.toUpperCase()}`,
                complaint._id.toString(),
                'Complaint',
                `Status updated to ${status}.${adminComment ? ` Comment: ${adminComment}` : ''}`,
                req.ip || req.socket.remoteAddress || ''
            );
        } catch (err) { console.error("Audit log failed", err) }

        res.json(complaint);
    } else {
        res.status(404);
        throw new Error('Complaint not found');
    }
});
