import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Admin from '../models/Admin';
import generateToken from '../utils/generateToken';
import { z } from 'zod';
import sendEmail from '../utils/sendEmail';
import { getWelcomeEmail } from '../utils/emailTemplates';

// Zod Schemas
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['student', 'guardian', 'security']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const {
        name, email, password, role,
        gender, phone, address, age,
        guardianName, relation, guardianContact, guardianContact2,
        course, branch, year, applicationNum, aadharNum, studentId
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student', // Default to student
        profile: {
            gender,
            phone,
            address,
            age: age ? parseInt(age) : undefined,
            guardianName,
            relation,
            guardianContact,
            guardianContact2,
            course,
            branch,
            year: year ? parseInt(year) : undefined,
            applicationNum,
            aadharNum,
        }
    });

    if (user) {
        // Send Welcome Email
        try {
            const html = getWelcomeEmail(user.name);
            await sendEmail({
                email: user.email,
                subject: 'Welcome to Smart HMS',
                message: `Hi ${user.name}, Welcome to Smart HMS! Your account has been created successfully.`,
                html
            });
        } catch (error) {
            console.error('Email send failed:', error);
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            token: generateToken(user._id as unknown as string),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check in Users first (Students/Security)
    let user: any = await User.findOne({ email });
    let role;

    if (user) {
        role = user.role;
    } else {
        // If not found in Users, check in Admins
        user = await Admin.findOne({ email });
        if (user) role = 'admin';
    }

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role,
            profile: user.profile,
            token: generateToken(user._id as unknown as string),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    let user: any;

    if ((req as any).user.role === 'admin') {
        user = await Admin.findById((req as any).user._id).select('-password');
    } else {
        user = await User.findById((req as any).user._id).select('-password').populate({
            path: 'profile.room',
            populate: [
                {
                    path: 'occupants',
                    select: 'name email profile.studentId'
                },
                {
                    path: 'block',
                    select: 'name'
                },
                {
                    path: 'hostel',
                    select: 'name'
                }
            ]
        });
    }

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id);

    if (user) {
        const {
            studentId, course, year, guardianName, guardianContact,
            address, idProof, admissionLetter, gender, branch,
            relation, guardianContact2, phone, age, applicationNum, aadharNum,
            profileImage
        } = req.body;

        if (!user.profile) {
            user.profile = {};
        }

        if (studentId) user.profile.studentId = studentId;
        if (course) user.profile.course = course;
        if (year) user.profile.year = parseInt(year);
        if (guardianName) user.profile.guardianName = guardianName;
        if (guardianContact) user.profile.guardianContact = guardianContact;
        if (address) user.profile.address = address;
        if (idProof) user.profile.idProof = idProof;
        if (admissionLetter) user.profile.admissionLetter = admissionLetter;
        if (gender) user.profile.gender = gender;
        if (branch) user.profile.branch = branch;
        if (relation) user.profile.relation = relation;
        if (guardianContact2) user.profile.guardianContact2 = guardianContact2;
        if (phone) user.profile.phone = phone;
        if (age) user.profile.age = parseInt(age);
        if (applicationNum) user.profile.applicationNum = applicationNum;
        if (aadharNum) user.profile.aadharNum = aadharNum;
        if (profileImage) user.profile.profileImage = profileImage;

        // If documents are uploaded, setting verified to false to require re-verification?
        // Or just let admin verify. Let's keep it simple.

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profile: updatedUser.profile,
            token: generateToken(updatedUser._id as unknown as string),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Update meal preference (one-time)
// @route   PUT /api/auth/meal-preference
// @access  Private
export const updateMealPreference = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'student') {
        res.status(403);
        throw new Error('Only students can set meal preferences');
    }

    if (!user.profile?.isVerified || !user.profile?.room) {
        res.status(400);
        throw new Error('You must be verified and allocated a room before setting mess style');
    }

    if (user.profile.mealPreference) {
        res.status(400);
        throw new Error('Mess style is already set and cannot be changed');
    }

    const { preference } = req.body;
    if (!['Veg', 'Non-Veg'].includes(preference)) {
        res.status(400);
        throw new Error('Invalid preference. Must be Veg or Non-Veg');
    }

    user.profile.mealPreference = preference;
    await user.save();

    res.json({
        message: 'Mess style updated successfully',
        mealPreference: user.profile.mealPreference
    });
});
