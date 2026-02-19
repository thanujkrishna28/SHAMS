import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Visitor from '../models/Visitor';
import User from '../models/User';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Register a new visitor (Student)
// @route   POST /api/visitors
// @access  Private (Student)
export const registerVisitor = asyncHandler(async (req: any, res: Response) => {
    const { visitorName, relation, visitDate, expectedTime, purpose } = req.body;

    const visitor = await Visitor.create({
        student: req.user._id,
        visitorName,
        relation,
        visitDate,
        expectedTime,
        adminComment: purpose // Quick way to store purpose if needed, or add field
    });

    await notifyAdmins(
        'New Visitor Registered',
        `Student ${req.user.name} registered a visitor: ${visitorName} for ${new Date(visitDate).toLocaleDateString()}`,
        'info'
    );

    res.status(201).json(visitor);
});

// @desc    Get my registered visitors
// @route   GET /api/visitors/my
// @access  Private (Student)
export const getMyVisitors = asyncHandler(async (req: any, res: Response) => {
    const visitors = await Visitor.find({ student: req.user._id }).sort({ visitDate: -1 });
    // Also include active status if any
    res.json(visitors);
});

// @desc    Get all visitors (Admin/Security)
// @route   GET /api/visitors
// @access  Private (Admin/Security)
export const getAllVisitors = asyncHandler(async (req: any, res: Response) => {
    const { status, date } = req.query;
    let query: any = {};

    if (status) query.status = status;
    if (date) {
        // Simple date match for 'YYYY-MM-DD'
        const start = new Date(date as string);
        const end = new Date(date as string);
        end.setHours(23, 59, 59, 999);
        query.visitDate = { $gte: start, $lte: end };
    }

    const visitors = await Visitor.find(query)
        .populate('student', 'name email profile.roomNumber profile.block profile.studentId')
        .sort({ visitDate: 1 }); // Soonest first

    res.json(visitors);
});

// @desc    Update visitor status (Security/Admin)
// @route   PUT /api/visitors/:id
// @access  Private (Admin/Security)
export const updateVisitorStatus = asyncHandler(async (req: any, res: Response) => {
    const { status, remarks } = req.body;
    const visitor = await Visitor.findById(req.params.id);

    if (visitor) {
        visitor.status = status;
        if (remarks) visitor.adminComment = remarks;

        if (status === 'approved' || status === 'rejected') {
            visitor.approvedBy = req.user._id;
        }
        if (status === 'checked-in') {
            visitor.checkInTime = new Date();
        }
        if (status === 'departed') {
            visitor.checkOutTime = new Date();
        }

        await visitor.save();

        // Notify Student
        await createNotification(
            visitor.student.toString(),
            `Visitor Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your visitor ${visitor.visitorName} has been ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
            status === 'approved' || status === 'checked-in' ? 'success' : 'info'
        );

        // Audit Log
        try {
            await logAudit(
                req.user._id,
                `VISITOR_${status.toUpperCase()}`,
                visitor._id.toString(),
                'Visitor',
                `Status updated to ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
                req.ip || req.socket.remoteAddress || ''
            );
        } catch (e) { }

        res.json(visitor);
    } else {
        res.status(404);
        throw new Error('Visitor entry not found');
    }
});
