import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Admin from '../models/Admin';
import Warden from '../models/Warden';
import sendEmail from '../utils/sendEmail';

// @desc    Create a new Warden
// @route   POST /api/wardens
// @access  Private (Chief Warden/Admin)
export const createWarden = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Check if user exists in any collection
    const studentExists = await User.findOne({ email });
    const adminExists = await Admin.findOne({ email });
    const wardenExists = await Warden.findOne({ email });

    if (studentExists || adminExists || wardenExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    const warden = await Warden.create({
        name,
        email,
        password,
        role: 'warden',
        isActive: true
    });

    if (warden) {
        try {
            await sendEmail({
                email: warden.email,
                subject: 'Your Warden Credentials - Smart HMS',
                message: `Hi ${name},\n\nYou have been appointed as a Warden.\nYour login credentials are:\nEmail: ${email}\nPassword: ${password}\n\nPlease login at the Administrative Portal.`,
                html: `
                    <h1>Welcome to Smart HMS</h1>
                    <p>Hi ${name},</p>
                    <p>You have been appointed as a <strong>Warden</strong>.</p>
                    <p>Your login credentials are:</p>
                    <ul>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${password}</li>
                    </ul>
                    <p>Please login at the Administrative Portal to get started.</p>
                `
            });
        } catch (error) {
            console.error('Failed to send email to warden', error);
        }

        res.status(201).json({
            message: 'Warden created successfully and credentials sent to mail',
            data: {
                _id: warden._id,
                name: warden.name,
                email: warden.email
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid warden data');
    }
});

// @desc    Get all Wardens/Chief Wardens
// @route   GET /api/wardens
// @access  Private (Admin/Chief Warden)
export const getAllWardens = asyncHandler(async (req: Request, res: Response) => {
    const regularWardens = await Warden.find({}).select('-password');
    const chiefWardens = await Admin.find({ role: 'chief_warden' }).select('-password');
    
    res.json([...regularWardens, ...chiefWardens]);
});
