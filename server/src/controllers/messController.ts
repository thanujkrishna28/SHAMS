import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import MessMenu from '../models/MessMenu';
import MessFeedback from '../models/MessFeedback';
import User from '../models/User';
import { createNotification, notifyAdmins } from './notificationController';

// @desc    Get weekly menu
// @route   GET /api/mess/menu
// @access  Public
export const getWeeklyMenu = asyncHandler(async (req: Request, res: Response) => {
    const count = await MessMenu.countDocuments();
    if (count === 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const defaultMenu = days.map(day => ({
            day,
            breakfast: { veg: [], nonVeg: [] },
            lunch: { veg: [], nonVeg: [] },
            dinner: { veg: [], nonVeg: [] }
        }));
        await MessMenu.insertMany(defaultMenu);
    }

    const menu = await MessMenu.find({}).sort({ _id: 1 });
    res.json(menu);
});

// @desc    Update entire weekly menu
// @route   PUT /api/mess/menu
// @access  Admin
export const updateWeeklyMenu = asyncHandler(async (req: Request, res: Response) => {
    const { menu } = req.body;

    if (!menu || !Array.isArray(menu)) {
        res.status(400);
        throw new Error('Invalid menu data');
    }

    for (const dayMenu of menu) {
        await MessMenu.findOneAndUpdate(
            { day: dayMenu.day },
            dayMenu,
            { new: true, upsert: true }
        );
    }

    // Notify Students about menu update
    const students = await User.find({ role: 'student' });
    for (const student of students) {
        await createNotification(
            student._id.toString(),
            'Mess Menu Updated',
            'The weekly mess menu has been updated. Check it out now!',
            'info'
        );
    }

    res.json({ message: 'Menu updated successfully' });
});

// @desc    Update specific day menu
// @route   PUT /api/mess/menu/:day
// @access  Admin
export const updateDayMenu = asyncHandler(async (req: Request, res: Response) => {
    const { day } = req.params;
    const { breakfast, lunch, dinner } = req.body;

    const updatedMenu = await MessMenu.findOneAndUpdate(
        { day },
        { breakfast, lunch, dinner },
        { new: true }
    );

    if (!updatedMenu) {
        res.status(404);
        throw new Error('Day not found');
    }

    res.json(updatedMenu);
});

// @desc    Submit feedback
// @route   POST /api/mess/feedback
// @access  Privte (Student)
export const submitFeedback = asyncHandler(async (req: any, res: Response) => {
    const { rating, comment, category, isAnonymous, mealType } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const feedback = await MessFeedback.create({
        student: user._id,
        studentName: isAnonymous ? 'Anonymous' : user.name,
        studentRoom: isAnonymous ? '' : user.profile?.roomNumber,
        rating,
        category,
        comment,
        mealType,
        isAnonymous
    });

    // Notify Admins about new feedback
    await notifyAdmins(
        'New Mess Feedback',
        `New feedback received (${rating} stars): ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
        'info'
    );

    res.status(201).json(feedback);
});

// @desc    Get feedback
// @route   GET /api/mess/feedback
// @access  Private (Admin)
export const getFeedback = asyncHandler(async (req: any, res: Response) => {
    const { limit = 20, page = 1 } = req.query;

    const feedback = await MessFeedback.find({})
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const count = await MessFeedback.countDocuments({});

    res.json({
        feedback,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page)
    });
});

// @desc    Delete feedback (Moderation)
// @route   DELETE /api/mess/feedback/:id
// @access  Admin
export const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedback = await MessFeedback.findById(req.params.id);

    if (feedback) {
        await feedback.deleteOne();
        res.json({ message: 'Feedback removed' });
    } else {
        res.status(404);
        throw new Error('Feedback not found');
    }
});
