import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Room, { IRoom } from '../models/Room';

// @desc    Get all rooms (optionally filtered by block)
// @route   GET /api/rooms
// @access  Private (Admin)
export const getRooms = asyncHandler(async (req: Request, res: Response) => {
    const { block, isAC } = req.query;

    let query: any = {};
    if (block) {
        query.block = block as string;
    }
    if (isAC !== undefined && isAC !== '') {
        query.isAC = isAC === 'true';
    }

    // Lazy cleanup of expired locks could happen here, or we just trust the status.
    // Ideally, we'd run a cleanup, but for this feature we will trust the lock logic.

    const rooms = await Room.find(query).populate('occupants', 'name email profile.studentId').sort({ roomNumber: 1 });

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
    const { block, floor, roomNumber, capacity, type, isAC } = req.body;

    const roomExists = await Room.findOne({ roomNumber });

    if (roomExists) {
        res.status(400);
        throw new Error('Room already exists');
    }

    const room = await Room.create({
        block,
        floor,
        roomNumber,
        capacity,
        type,
        isAC
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
    const { block, floor, startRange, endRange, prefix, capacity, type, isAC } = req.body;

    if (!block || !floor || !startRange || !endRange) {
        res.status(400);
        throw new Error('Missing required fields for bulk creation');
    }

    const roomsToCreate = [];
    const skippedRooms = [];

    for (let i = startRange; i <= endRange; i++) {
        const roomNumber = `${prefix || ''}${i}`;

        // Check if room exists
        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            skippedRooms.push(roomNumber);
            continue;
        }

        roomsToCreate.push({
            block,
            floor,
            roomNumber,
            capacity,
            type,
            isAC: !!isAC,
            status: 'available'
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

// @desc    Lock a room for allocation
// @route   POST /api/rooms/:id/lock
// @access  Private (Student)
export const lockRoom = asyncHandler(async (req: any, res: Response) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Check if locked and valid
    if (room.status === 'locked' && room.lockExpiresAt && room.lockExpiresAt > new Date()) {
        const lockedById = room.lockedBy ? room.lockedBy.toString() : '';
        if (lockedById === req.user._id.toString()) {
            res.json({ message: 'Room already locked by you', room });
            return;
        }
        res.status(400);
        throw new Error('Room is currently locked by another student');
    }

    // Check if full
    if (room.occupants.length >= room.capacity) {
        res.status(400);
        throw new Error('Room is full');
    }

    room.status = 'locked';
    room.lockedBy = req.user._id;
    room.lockExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await room.save();

    res.json(room);
});
