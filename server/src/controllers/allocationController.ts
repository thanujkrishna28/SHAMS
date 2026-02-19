import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Allocation from '../models/Allocation';
import Room from '../models/Room';
import User from '../models/User';
import { createNotification, notifyAdmins } from './notificationController';
import { logAudit } from '../utils/auditLogger';

// @desc    Create / Request room allocation
// @route   POST /api/allocations
// @access  Private (Student)
export const requestAllocation = asyncHandler(async (req: Request, res: Response) => {
    const { requestedBlock, requestedRoomType, requestType, reason, lockedRoomId } = req.body;
    const studentId = req.user._id;

    // Check if pending request exists
    const pending = await Allocation.findOne({ student: studentId, status: 'pending' });
    if (pending) {
        res.status(400);
        throw new Error('You already have a pending allocation request');
    }

    if (lockedRoomId) {
        const room = await Room.findById(lockedRoomId);
        if (!room) {
            res.status(404);
            throw new Error('Room not found');
        }
        // Validate lock ownership
        if (room.status === 'locked') {
            if (!room.lockedBy || room.lockedBy.toString() !== studentId.toString()) {
                res.status(400);
                throw new Error('You do not hold the lock for this room');
            }
            if (room.lockExpiresAt && new Date() > room.lockExpiresAt) {
                res.status(400);
                throw new Error('Room lock has expired');
            }
        } else {
            // If room is not locked but requested as lockedRoomId, it might mean it was free or lock expired/cleared?
            // Ideally we only allow if status is locked. But for resilience, if it's available, maybe we just proceed?
            // User requirement: "System locks that bed... Admin approves...".
            // So the room MUST be locked by the user.
            // If status changed to something else (e.g. someone else took it, unlikely if locked correctly), fail.
            res.status(400);
            throw new Error('Room is not locked by you');
        }
    }

    // Create allocation request
    const allocation = await Allocation.create({
        student: studentId,
        requestedBlock,
        requestedRoomType: requestedRoomType || 'double',
        requestType: requestType || 'initial',
        reason,
        lockedRoom: lockedRoomId
    });

    await notifyAdmins(
        'New Allocation Request',
        `Student ${(req as any).user.name} requested a room allocation in Block ${requestedBlock}`,
        'info'
    );

    res.status(201).json(allocation);
});

// @desc    Get my allocations
// @route   GET /api/allocations/my
// @access  Private (Student)
export const getMyAllocations = asyncHandler(async (req: Request, res: Response) => {
    const allocations = await Allocation.find({ student: req.user._id })
        .populate('lockedRoom', 'roomNumber block floor')
        .populate('assignedRoom', 'roomNumber block floor')
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
        .populate('assignedRoom', 'roomNumber block floor')
        .populate('lockedRoom', 'roomNumber block floor status') // See what they locked
        .sort({ createdAt: -1 });

    res.json(allocations);
});

// @desc    Approve/Reject allocation
// @route   PUT /api/allocations/:id/status
// @access  Private (Admin)
export const updateAllocationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, roomId, adminComment } = req.body;
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
        res.status(404);
        throw new Error('Allocation request not found');
    }

    // If there was a locked room, we should unlock it now (either we use it or we release it)
    if (allocation.lockedRoom) {
        const lockedRoom = await Room.findById(allocation.lockedRoom);
        if (lockedRoom && lockedRoom.status === 'locked') {
            // Clear lock
            lockedRoom.status = 'available'; // Default back to available, will be updated to full/occupied if assigned below
            lockedRoom.lockedBy = undefined;
            lockedRoom.lockExpiresAt = undefined;
            await lockedRoom.save();
        }
    }

    if (status === 'approved') {
        if (!roomId && !allocation.lockedRoom) {
            res.status(400);
            throw new Error('Please select a room to allocate');
        }

        const targetRoomId = roomId || allocation.lockedRoom;
        const room = await Room.findById(targetRoomId);

        if (!room) {
            res.status(404);
            throw new Error('Room not found');
        }

        if (room.occupants.length >= room.capacity) {
            res.status(400);
            throw new Error('Room is fully occupied');
        }

        if (room.status === 'maintenance') {
            res.status(400);
            throw new Error('Cannot allocate room under maintenance');
        }

        // Logic for handling swaps or changes
        if (allocation.requestType === 'change' || allocation.requestType === 'swap') {
            // Find current room and remove student
            const currentRoom = await Room.findOne({ occupants: allocation.student });
            if (currentRoom) {
                currentRoom.occupants = currentRoom.occupants.filter(id => id.toString() !== allocation.student.toString());
                // Update status if it was full
                if (currentRoom.status === 'full') currentRoom.status = 'available';
                await currentRoom.save();
            }
        }

        // Add student to new room
        room.occupants.push(allocation.student);
        // Check capacity
        if (room.occupants.length >= room.capacity) {
            room.status = 'full';
        } else {
            // If we just unlocked it above, it's 'available', which is correct for partial occupancy
            room.status = 'available';
        }

        await room.save();

        // Update User profile
        const user = await User.findById(allocation.student);
        if (user) {
            user.profile = {
                ...user.profile,
                room: room._id
            };
            await user.save();
        }

        allocation.assignedRoom = room._id;
    }

    allocation.status = status;
    allocation.adminComment = adminComment;
    await allocation.save();

    await createNotification(
        (allocation.student as any).toString(),
        `Room Allocation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your room allocation request for ${(allocation.requestedRoomType || 'room')} has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
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
