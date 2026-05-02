import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/Event';
import { createNotification } from './notificationController';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await Event.find().sort({ date: 1 }).populate('organizer', 'name');
    res.json(events);
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Admin/Chief Warden)
export const createEvent = asyncHandler(async (req: any, res: Response) => {
    const { title, description, date, location, category, image } = req.body;

    const event = await Event.create({
        title,
        description,
        date,
        location,
        category,
        image,
        organizer: req.user._id
    });

    // Notify all students (simple implementation)
    // In a real app, you might want to use a more efficient way to notify many users
    // For now, let's just log or notify recent users

    res.status(201).json(event);
});

// @desc    Attend an event
// @route   POST /api/events/:id/attend
// @access  Private (Student)
export const attendEvent = asyncHandler(async (req: any, res: Response) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.attendees.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already attending');
    }

    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: 'Marked as attending' });
});
