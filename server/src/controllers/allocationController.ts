import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Allocation from '../models/Allocation';
import Room from '../models/Room';
import User from '../models/User';
import Hostel from '../models/Hostel';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Create / Request room allocation
// @route   POST /api/allocations
// @access  Private (Student)
export const requestAllocation = asyncHandler(async (req: any, res: Response) => {
    const { hostel, block, room, reason } = req.body;
    const studentId = req.user._id;

    // Check if gender matches hostel type
    const student = await User.findById(studentId);
    const targetHostel = await Hostel.findById(hostel);

    if (!student || !targetHostel) {
        res.status(404);
        throw new Error('Student or Hostel not found');
    }

    const expectedType = student.profile?.gender === 'Male' ? 'BOYS' : 'GIRLS';
    if (targetHostel.type !== expectedType) {
        res.status(400);
        throw new Error(`This hostel is for ${targetHostel.type.toLowerCase()} only. Your gender is ${student.profile?.gender}.`);
    }

    // Check if room is valid and available
    const targetRoom = await Room.findById(room);
    if (!targetRoom) {
        res.status(404);
        throw new Error('Room not found');
    }
    if (targetRoom.status === 'Maintenance' || targetRoom.status === 'maintenance') {
        res.status(400);
        throw new Error('Room is currently under maintenance');
    }
    if (targetRoom.occupants.length >= targetRoom.capacity) {
        res.status(400);
        throw new Error('Room is already full');
    }

    // Check if pending request exists
    const pending = await Allocation.findOne({ student: studentId, status: 'pending' });
    if (pending) {
        res.status(400);
        throw new Error('You already have a pending allocation request');
    }

    // Create allocation request
    const allocation = await Allocation.create({
        student: studentId,
        hostel,
        block,
        room,
        requestType: 'initial',
        reason
    });

    await notifyAdmins(
        'New Allocation Request',
        `Student ${req.user.name} requested a room in ${targetHostel.name}`,
        'info'
    );

    res.status(201).json(allocation);
});

// @desc    Get my allocations
// @route   GET /api/allocations/my
// @access  Private (Student)
export const getMyAllocations = asyncHandler(async (req: Request, res: Response) => {
    const allocations = await Allocation.find({ student: req.user._id })
        .populate('hostel', 'name type')
        .populate('block', 'name')
        .populate('room', 'roomNumber block floor')
        .sort({ createdAt: -1 });
    res.json(allocations);
});

// @desc    Get all allocations (Admin)
// @route   GET /api/allocations
// @access  Private (Admin)
export const getAllAllocations = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    let query = {};
    if (status) query = { status };

    const allocations = await Allocation.find(query)
        .populate('student', 'name email profile.studentId')
        .populate('hostel', 'name type')
        .populate('block', 'name')
        .populate('room', 'roomNumber block floor status')
        .sort({ createdAt: -1 });

    res.json(allocations);
});

// @desc    Approve/Reject allocation
// @route   PUT /api/allocations/:id/status
// @access  Private (Admin)
export const updateAllocationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, adminComment } = req.body;
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
        res.status(404);
        throw new Error('Allocation request not found');
    }

    if (status === 'approved') {
        const room = await Room.findById(allocation.room);

        if (!room) {
            res.status(404);
            throw new Error('Requested room not found');
        }

        // Atomic update to prevent overbooking
        const updateResult = await Room.updateOne(
            {
                _id: allocation.room,
                $expr: { $lt: [{ $size: "$occupants" }, "$capacity"] }
            },
            {
                $push: { occupants: allocation.student },
            }
        );

        if (updateResult.modifiedCount === 0) {
            res.status(400);
            throw new Error('Room is already at full capacity');
        }

        // After push, check if it's now full and update status
        const updatedRoom = await Room.findById(allocation.room);
        if (updatedRoom && updatedRoom.occupants.length >= updatedRoom.capacity) {
            updatedRoom.status = 'Full';
            await updatedRoom.save();
        } else if (updatedRoom) {
            updatedRoom.status = 'Available';
            await updatedRoom.save();
        }

        // Update User profile
        const user = await User.findById(allocation.student);
        if (user) {
            user.profile = {
                ...user.profile,
                room: updatedRoom?._id
            };
            await user.save();
        }
    }

    allocation.status = status;
    allocation.adminComment = adminComment;
    await allocation.save();

    await createNotification(
        (allocation.student as any).toString(),
        `Room Allocation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your room allocation request has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
        status === 'approved' ? 'success' : 'alert'
    );

    // Audit Log
    try {
        await logAudit(
            (req as any).user._id,
            `ALLOCATION_${status.toUpperCase()}`,
            allocation._id.toString(),
            'Allocation',
            `Status updated to ${status}.${adminComment ? ` Comment: ${adminComment}` : ''}`,
            req.ip || req.socket.remoteAddress || ''
        );
    } catch (err) { console.error("Audit log failed", err) }

    res.json(allocation);
});
