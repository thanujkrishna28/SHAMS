import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification';
import User from '../models/User';
import { emitNotification } from '../utils/socket';

export const createNotification = async (recipient: string, title: string, message: string, type: string = 'info') => {
    const notification = await Notification.create({ recipient, title, message, type });
    emitNotification(recipient, notification);
    return notification;
};

export const notifyAdmins = async (title: string, message: string, type: string = 'info') => {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
        await createNotification(admin._id.toString(), title, message, type);
    }
};

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req: any, res: Response) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: any, res: Response) => {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.recipient.toString() === req.user._id.toString()) {
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: any, res: Response) => {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
});
