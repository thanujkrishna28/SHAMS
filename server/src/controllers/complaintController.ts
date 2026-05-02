import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';
import { analyzeComplaint } from '../utils/aiService';
import { sendSmartNotificationEmail } from '../utils/mailService';
import User from '../models/User';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = asyncHandler(async (req: any, res: Response) => {
    const { title, description, category, priority } = req.body;

    // AI Intelligence: Auto-classify and Prioritize
    const aiAnalysis = await analyzeComplaint(title, description);
    
    // Prefer AI suggestion if confident, else fallback to user input
    const finalCategory = (['maintenance', 'cleanliness', 'electrical', 'plumbing', 'other'].includes(aiAnalysis?.category as string))
        ? aiAnalysis?.category
        : (category || 'maintenance');

    const finalPriority = (['low', 'medium', 'high'].includes(aiAnalysis?.priority as string))
        ? aiAnalysis?.priority
        : (priority || 'medium');

    const suggestedResolutionSteps = aiAnalysis?.resolutionSteps || null;

    const dueDate = new Date();
    if (finalPriority === 'high') {
        dueDate.setHours(dueDate.getHours() + 24); // 24 hours SLA
    } else if (finalPriority === 'medium') {
        dueDate.setDate(dueDate.getDate() + 3); // 3 days SLA
    } else {
        dueDate.setDate(dueDate.getDate() + 7); // 7 days SLA
    }

    const complaint = await Complaint.create({
        student: req.user._id,
        title,
        description,
        category: finalCategory,
        priority: finalPriority,
        suggestedResolutionSteps,
        dueDate,
        status: 'pending'
    });

    await notifyAdmins(
        'New Complaint Received',
        `Student ${req.user.name} submitted a new complaint: ${title}`,
        'warning'
    );

    // Email notification to student
    try {
        await sendSmartNotificationEmail(
            req.user.email,
            req.user.name,
            'Complaint Received',
            `We have received your complaint: "${title}". It has been classified as ${finalCategory} with ${finalPriority} priority.`
        );
    } catch (err) { console.error("Email failed", err) }

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
        
        if (status === 'resolved' || status === 'closed') {
            complaint.resolvedAt = new Date();
        }

        await complaint.save();

        await createNotification(
            complaint.student.toString(),
            `Complaint ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your complaint "${complaint.title}" has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
            status === 'resolved' ? 'success' : 'info'
        );

        // Email notification
        const student = await User.findById(complaint.student);
        if (student) {
            try {
                await sendSmartNotificationEmail(
                    student.email,
                    student.name,
                    `Complaint ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    `Your complaint "${complaint.title}" has been ${status}. ${adminComment ? `Staff Comment: ${adminComment}` : ''}`
                );
            } catch (err) { console.error("Email failed", err) }
        }

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
