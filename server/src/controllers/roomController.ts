import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Room, { IRoom } from '../models/Room';
import { generateRoomRecommendation } from '../utils/aiService';

// @desc    Get AI Room Recommendation
// @route   POST /api/rooms/recommendation
// @access  Private (Student)
export const getRoomRecommendation = asyncHandler(async (req: Request, res: Response) => {
    const { hostelId, preferences } = req.body;

    // Fetch some available rooms in this hostel
    const availableRooms = await Room.find({ 
        hostel: hostelId, 
        status: { $in: ['Available', 'available'] } 
    })
    .populate('block', 'name')
    .limit(10); // Limit to 10 for AI context

    if (availableRooms.length === 0) {
        res.json({ recommendation: "No available rooms found for recommendation." });
        return;
    }

    const recommendation = await generateRoomRecommendation(preferences, availableRooms);
    res.json({ recommendation });
});

// @desc    Get all rooms (optionally filtered by block)
// @route   GET /api/rooms
// @access  Private (Admin)
export const getRooms = asyncHandler(async (req: Request, res: Response) => {
    const { blockId, hostelId, isAC, status } = req.query;

    let query: any = {};
    if (blockId) {
        query.block = blockId as string;
    }
    if (hostelId) {
        query.hostel = hostelId as string;
    }
    if (isAC !== undefined && isAC !== '') {
        query.isAC = isAC === 'true';
    }
    if (status) {
        query.status = status as string;
    }

    const rooms = await Room.find(query)
        .populate('occupants', 'name email profile.studentId')
        .populate('block', 'name')
        .populate('hostel', 'name type')
        .sort({ roomNumber: 1 });

    res.json(rooms);
});

// @desc    Get a singleroom by ID
// @route   GET /api/rooms/:id
// @access  Private (Admin)
export const getRoomById = asyncHandler(async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email profile.studentId');

    if (room) {
        res.json(room);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin)
export const createRoom = asyncHandler(async (req: Request, res: Response) => {
    const { hostel, block, floor, roomNumber, capacity, type, isAC } = req.body;

    const roomExists = await Room.findOne({ roomNumber, hostel });

    if (roomExists) {
        res.status(400);
        throw new Error('Room already exists in this hostel');
    }

    const room = await Room.create({
        hostel,
        block,
        floor,
        roomNumber,
        capacity,
        type,
        isAC,
        status: 'Available'
    });

    if (room) {
        res.status(201).json(room);
    } else {
        res.status(400);
        throw new Error('Invalid room data');
    }
});

// @desc    Create bulk rooms
// @route   POST /api/rooms/bulk
// @access  Private (Admin)
export const createBulkRooms = asyncHandler(async (req: Request, res: Response) => {
    const { hostel, block, floor, startRange, endRange, prefix, capacity, type, isAC } = req.body;

    if (!hostel || !block || !floor || !startRange || !endRange) {
        res.status(400);
        throw new Error('Missing required fields for bulk creation');
    }

    const roomsToCreate = [];
    const skippedRooms = [];

    for (let i = startRange; i <= endRange; i++) {
        const roomNumber = `${prefix || ''}${i}`;

        // Check if room exists in this hostel
        const exists = await Room.findOne({ roomNumber, hostel });
        if (exists) {
            skippedRooms.push(roomNumber);
            continue;
        }

        roomsToCreate.push({
            hostel,
            block,
            floor,
            roomNumber,
            capacity,
            type,
            isAC: !!isAC,
            status: 'Available'
        });
    }

    if (roomsToCreate.length === 0) {
        res.status(400);
        throw new Error(`No rooms created. ${skippedRooms.length > 0 ? `Skipped duplicates: ${skippedRooms.join(', ')}` : 'Invalid range.'}`);
    }

    const createdRooms = await Room.insertMany(roomsToCreate);

    res.status(201).json({
        message: `Successfully created ${createdRooms.length} rooms.`,
        createdCount: createdRooms.length,
        skippedCount: skippedRooms.length,
        skippedRooms
    });
});

// @desc    Create smart batch rooms (manual list)
// @route   POST /api/rooms/smart-batch
// @access  Private (Admin)
export const createSmartBatch = asyncHandler(async (req: Request, res: Response) => {
    const { rooms } = req.body;

    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        res.status(400);
        throw new Error('No rooms provided');
    }

    try {
        const result = await Room.insertMany(rooms, { ordered: false });
        res.status(201).json({
            message: `Successfully created ${result.length} rooms.`,
            createdCount: result.length
        });
    } catch (error: any) {
        // If some operations failed (e.g. duplicates), Mongoose still inserts non-conflicting ones
        // but throws a BulkWriteError.
        if (error.name === 'BulkWriteError' || error.code === 11000) {
            const insertedCount = error.insertedDocs?.length || 0;
            res.status(201).json({
                message: `Partial success: Created ${insertedCount} rooms. Some rooms were skipped as they already exist.`,
                createdCount: insertedCount,
                errorCount: (rooms.length - insertedCount)
            });
        } else {
            res.status(400);
            throw new Error(error.message || 'Batch creation failed');
        }
    }
});

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id);

    if (room) {
        room.block = req.body.block || room.block;
        room.floor = req.body.floor || room.floor;
        room.capacity = req.body.capacity || room.capacity;
        room.type = req.body.type || room.type;
        if (req.body.isAC !== undefined) room.isAC = req.body.isAC;
        room.status = req.body.status || room.status;

        const updatedRoom = await room.save();
        res.json(updatedRoom);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id);

    if (room) {
        // Check if room has occupants before deleting
        if (room.occupants && room.occupants.length > 0) {
            res.status(400);
            throw new Error('Cannot delete room with active occupants');
        }

        await Room.deleteOne({ _id: room._id });
        res.json({ message: 'Room removed' });
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Lock a room for allocation (Atomic)
// @route   POST /api/rooms/:id/lock
// @access  Private (Student)
export const lockRoom = asyncHandler(async (req: any, res: Response) => {
    const roomId = req.params.id;
    const userId = req.user._id;

    // A room is "available for locking" if:
    // 1. It is not locked
    // 2. OR its existing lock has expired
    // 3. OR it is locked by the CURRENT user (to renew/extend)
    // AND it has capacity

    const now = new Date();
    const lockDuration = 80 * 1000; // 80 seconds
    const expiresAt = new Date(now.getTime() + lockDuration);

    const room = await Room.findOneAndUpdate(
        {
            _id: roomId,
            $or: [
                { status: { $ne: 'locked' } },
                { lockExpiresAt: { $lt: now } },
                { lockedBy: userId }
            ],
            $expr: { $lt: [{ $size: "$occupants" }, "$capacity"] }
        },
        {
            $set: {
                status: 'locked',
                lockedBy: userId,
                lockExpiresAt: expiresAt
            }
        },
        { new: true }
    );

    if (!room) {
        // Find why it failed to give a clear message
        const targetRoom = await Room.findById(roomId);
        if (!targetRoom) {
            res.status(404);
            throw new Error('Room not found');
        }
        if (targetRoom.occupants.length >= targetRoom.capacity) {
            res.status(400);
            throw new Error('Room is currently full');
        }
        res.status(400);
        throw new Error('Room is currently reserved by another student. Please try again in a few minutes.');
    }

    res.json({
        message: 'Room reserved for 80 seconds',
        room
    });
});

// @desc    Unlock a room (Manual release)
// @route   POST /api/rooms/:id/unlock
// @access  Private (Student)
export const unlockRoom = asyncHandler(async (req: any, res: Response) => {
    const room = await Room.findOneAndUpdate(
        {
            _id: req.params.id,
            lockedBy: req.user._id
        },
        {
            $set: { status: 'Available' },
            $unset: { lockedBy: "", lockExpiresAt: "" }
        },
        { new: true }
    );

    if (!room) {
        res.status(400);
        throw new Error('You do not have a reservation on this room');
    }

    res.json({ message: 'Reservation released', room });
});
