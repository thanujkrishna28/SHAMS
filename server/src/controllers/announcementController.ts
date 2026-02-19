import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement';
import User from '../models/User';
import { createNotification } from './notificationController';

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin)
export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const { title, message, type, targetType, targetValue, expiryDays } = req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiryDays || 7)); // Default 7 days

    const announcement = await Announcement.create({
        title,
        message,
        type: type || 'normal',
        targetAudience: {
            type: targetType || 'all',
            value: targetValue,
        },
        expiresAt,
        createdBy: req.user._id,
    });

    // Notify Students (Simpler approach: Notify all if "all", or targeted students)
    const students = await User.find({ role: 'student' });
    for (const student of students) {
        // In a real app, you'd check block/floor here
        await createNotification(
            student._id.toString(),
            `Broadcasting: ${title}`,
            message,
            type === 'emergency' ? 'alert' : 'info'
        );
    }

    res.status(201).json(announcement);
});

// @desc    Get active announcements for current user
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    // Base query: Active announcements only
    const query: any = {
        expiresAt: { $gt: new Date() },
    };

    if (user && user.role === 'student' && user.profile?.room) {
        query['$or'] = [
            { 'targetAudience.type': 'all' },
        ];
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
});
