import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Block from '../models/Block';
import Room from '../models/Room';

// @desc    Get all blocks or blocks for a specific hostel
// @route   GET /api/blocks
// @access  Private
export const getBlocks = asyncHandler(async (req: any, res: Response) => {
    const { hostelId } = req.query;
    const query = hostelId ? { hostel: hostelId } : {};

    const blocks = await Block.find(query).populate('hostel', 'name type');

    // Enrich with room counts
    const enrichedBlocks = await Promise.all(blocks.map(async (block) => {
        const rooms = await Room.find({ block: block._id });
        const roomCount = rooms.length;
        const availableRooms = rooms.filter(r => r.status === 'Available' || r.status === 'available').length;

        return {
            ...block.toObject(),
            roomCount,
            availableRooms
        };
    }));

    res.json(enrichedBlocks);
});

// @desc    Create a new block
// @route   POST /api/blocks
// @access  Private (Admin)
export const createBlock = asyncHandler(async (req: Request, res: Response) => {
    const { name, hostel, floors } = req.body;

    const blockExists = await Block.findOne({ name, hostel });
    if (blockExists) {
        res.status(400);
        throw new Error('Block already exists in this hostel');
    }

    const block = await Block.create({
        name,
        hostel,
        floors
    });

    res.status(201).json(block);
});

// @desc    Delete block
// @route   DELETE /api/blocks/:id
// @access  Private (Admin)
export const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
    const block = await Block.findById(req.params.id);

    if (block) {
        // Prevent deletion if rooms exist
        const roomExists = await Room.findOne({ block: block._id });
        if (roomExists) {
            res.status(400);
            throw new Error('Cannot delete block because rooms are associated with it');
        }

        await block.deleteOne();
        res.json({ message: 'Block removed' });
    } else {
        res.status(404);
        throw new Error('Block not found');
    }
});
