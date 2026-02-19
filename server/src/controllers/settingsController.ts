import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings';

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (so students can see maintenance mode etc)
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await Settings.find({});
    // Convert array of {key, value} to an object {key: value}
    const settingsObj = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
    res.json(settingsObj);
});

// @desc    Update settings
// @route   POST /api/settings
// @access  Private (Admin)
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body; // Expecting an object {key: value}

    for (const [key, value] of Object.entries(updates)) {
        await Settings.findOneAndUpdate(
            { key },
            { key, value },
            { upsert: true, new: true }
        );
    }

    res.json({ message: 'Settings updated successfully' });
});
