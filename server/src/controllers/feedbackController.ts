import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback';
import Warden from '../models/Warden';
import User from '../models/User';

// @desc    Submit feedback for a warden
// @route   POST /api/feedback
// @access  Private (Student)
export const submitFeedback = asyncHandler(async (req: any, res: Response) => {
    const { wardenId, rating, comment, isAnonymous } = req.body;

    const warden = await Warden.findById(wardenId);
    if (!warden) {
        res.status(404);
        throw new Error('Warden not found');
    }

    const feedback = await Feedback.create({
        warden: wardenId,
        student: req.user._id,
        rating,
        comment,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : true
    });

    res.status(201).json(feedback);
});

// @desc    Get warden feedback (Admin only)
// @route   GET /api/feedback/warden/:id
// @access  Private (Admin)
export const getWardenFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedback = await Feedback.find({ warden: req.params.id })
        .populate('student', 'name email') // Student details only visible to admin
        .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = feedback.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = feedback.length > 0 ? (totalRating / feedback.length).toFixed(1) : 0;

    res.json({
        feedback,
        avgRating
    });
});
