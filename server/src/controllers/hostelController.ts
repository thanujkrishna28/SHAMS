import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Hostel from '../models/Hostel';
import Block from '../models/Block';
import Room from '../models/Room';

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private (Admin/Student)
export const getHostels = asyncHandler(async (req: any, res: Response) => {
    const hostels = await Hostel.find({});

    // Enrich with block and room counts
    const enrichedHostels = await Promise.all(hostels.map(async (hostel) => {
        const blockCount = await Block.countDocuments({ hostel: hostel._id });
        const rooms = await Room.find({ hostel: hostel._id });
        const roomCount = rooms.length;
        const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
        const currentOccupants = rooms.reduce((acc, room) => acc + (room.occupants?.length || 0), 0);

        return {
            ...hostel.toObject(),
            blockCount,
            roomCount,
            totalCapacity,
            currentOccupants,
            occupancyRate: totalCapacity > 0 ? Math.round((currentOccupants / totalCapacity) * 100) : 0
        };
    }));

    res.json(enrichedHostels);
});

// @desc    Create a new hostel
// @route   POST /api/hostels
// @access  Private (Admin)
export const createHostel = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, description, wardenName, contactNumber } = req.body;

    const hostelExists = await Hostel.findOne({ name });
    if (hostelExists) {
        res.status(400);
        throw new Error('Hostel already exists with this name');
    }

    const hostel = await Hostel.create({
        name,
        type,
        description,
        wardenName,
        contactNumber,
        isActive: true
    });

    res.status(201).json(hostel);
});

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (Admin)
export const updateHostel = asyncHandler(async (req: Request, res: Response) => {
    const hostel = await Hostel.findById(req.params.id);

    if (hostel) {
        hostel.name = req.body.name || hostel.name;
        hostel.type = req.body.type || hostel.type;
        hostel.description = req.body.description || hostel.description;
        hostel.wardenName = req.body.wardenName || hostel.wardenName;
        hostel.contactNumber = req.body.contactNumber || hostel.contactNumber;
        hostel.isActive = req.body.isActive !== undefined ? req.body.isActive : hostel.isActive;

        const updatedHostel = await hostel.save();
        res.json(updatedHostel);
    } else {
        res.status(404);
        throw new Error('Hostel not found');
    }
});

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (Admin)
export const deleteHostel = asyncHandler(async (req: Request, res: Response) => {
    const hostel = await Hostel.findById(req.params.id);

    if (hostel) {
        // Prevent deletion if blocks exist
        const blockExists = await Block.findOne({ hostel: hostel._id });
        if (blockExists) {
            res.status(400);
            throw new Error('Cannot delete hostel because blocks are associated with it');
        }

        await hostel.deleteOne();
        res.json({ message: 'Hostel removed' });
    } else {
        res.status(404);
        throw new Error('Hostel not found');
    }
});
