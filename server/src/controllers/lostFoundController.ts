import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import LostFoundItem from '../models/LostFoundItem';

// @desc    Report lost/found item
// @route   POST /api/lost-found
// @access  Private
export const reportItem = asyncHandler(async (req: any, res: Response) => {
    const { title, description, type, category, location, date, contactInfo, image } = req.body;

    const item = await LostFoundItem.create({
        title,
        description,
        type,
        category,
        location,
        date: date || new Date(),
        contactInfo,
        image,
        reportedBy: req.user._id,
        status: 'Active'
    });

    res.status(201).json(item);
});

// @desc    Get all lost/found items
// @route   GET /api/lost-found
// @access  Private
export const getItems = asyncHandler(async (req: any, res: Response) => {
    const { type, category, status } = req.query;

    let query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const items = await LostFoundItem.find(query)
        .populate('reportedBy', 'name email profile.phone')
        .sort({ createdAt: -1 });

    res.json(items);
});

// @desc    Update item status (Mark as resolved)
// @route   PATCH /api/lost-found/:id
// @access  Private (Owner or Admin)
export const resolveItem = asyncHandler(async (req: any, res: Response) => {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to resolve this item');
    }

    item.status = 'Resolved';
    await item.save();

    res.json(item);
});

// @desc    Delete item
// @route   DELETE /api/lost-found/:id
// @access  Private (Owner or Admin)
export const deleteItem = asyncHandler(async (req: any, res: Response) => {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
});
