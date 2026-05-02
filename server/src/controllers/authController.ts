import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Admin from '../models/Admin';
import Warden from '../models/Warden';
import Settings from '../models/Settings';
import Fee from '../models/Fee';
import Notification from '../models/Notification';
import generateToken from '../utils/generateToken';
import { z } from 'zod';
import sendEmail from '../utils/sendEmail';
import { getWelcomeEmail, getOTPEmail } from '../utils/emailTemplates';
import QRCode from 'qrcode';
const { 
    generateSecret: libGenerateSecret, 
    generateURI: libGenerateURI, 
    verify: libVerify, 
    NobleCryptoPlugin, 
    ScureBase32Plugin 
} = require('otplib');

// Reconstruct authenticator using the functional API with explicit naming
const authenticator = {
    generateSecret: () => {
        console.log('[DEBUG] Generating secret...');
        return libGenerateSecret({
            crypto: new NobleCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });
    },
    keyuri: (accountName: string, issuer: string, secret: string) => {
        console.log('[DEBUG] Generating URI for:', accountName);
        return libGenerateURI({
            label: accountName,
            issuer: issuer,
            secret: secret,
            strategy: 'totp'
        });
    },
    verify: async (options: { token: string, secret: string }) => {
        console.log('[DEBUG] Verifying token...');
        const result = await libVerify({
            token: options.token,
            secret: options.secret,
            strategy: 'totp',
            crypto: new NobleCryptoPlugin()
        });
        return result.valid;
    }
};

// Zod Schemas
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
    console.log('Register request body:', { ...req.body, password: '***' });

    // Validate with Zod
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        console.error('Zod Validation failed:', validation.error.format());
        res.status(400);
        throw new Error(`Validation Error: ${validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }

    const {
        name, email, password, role,
        gender, phone, address, age,
        guardianName, relation, guardianContact, guardianContact2,
        course, branch, year, applicationNum, aadharNum, studentId
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        console.warn(`Registration failed: User already exists with email ${email}`);
        res.status(400);
        throw new Error('User already exists');
    }

    try {
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student', // Default to student
            profile: {
                studentId,
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
            console.log(`User created: ${user.email} (${user.role})`);
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

            // --- Auto-generate Fees for new students ---
            if (user.role === 'student') {
                try {
                    // 1. Admission Fee
                    const admissionFeeSetting = await Settings.findOne({ key: 'admissionFee' });
                    const admissionAmount = admissionFeeSetting ? Number(admissionFeeSetting.value) : 1000; 
                    
                    await Fee.create({
                        student: user._id,
                        type: 'Admission',
                        description: 'One-time admission and registration fee',
                        totalAmount: admissionAmount,
                        balanceAmount: admissionAmount,
                        paidAmount: 0,
                        status: 'PENDING',
                        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) 
                    });

                    // 2. Caution Deposit
                    const cautionDepositSetting = await Settings.findOne({ key: 'cautionDeposit' });
                    const cautionAmount = cautionDepositSetting ? Number(cautionDepositSetting.value) : 2000;

                    await Fee.create({
                        student: user._id,
                        type: 'Caution Deposit',
                        description: 'Refundable caution deposit for hostel assets',
                        totalAmount: cautionAmount,
                        balanceAmount: cautionAmount,
                        paidAmount: 0,
                        status: 'PENDING',
                        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                    });

                    await Notification.create({
                        recipient: user._id,
                        title: 'Initial Fees Generated',
                        message: `Your Admission Fee (₹${admissionAmount}) and Caution Deposit (₹${cautionAmount}) have been generated.`,
                        type: 'system',
                        read: false
                    });

                    console.log(`Auto-generated initial fees for student ${user._id}`);
                } catch (feeError) {
                    console.error('Failed to auto-generate initial fees:', feeError);
                }
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                token: generateToken(user._id as unknown as string),
            });
        }
    } catch (error: any) {
        console.error('Mongoose Registration Error:', error);
        res.status(400);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            throw new Error(`${field === 'email' ? 'Email' : field} already in use`);
        }
        throw new Error(error.message || 'Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    let { email, password, portal } = req.body;
    email = email?.toLowerCase().trim();

    // 1. Check Master Chief Warden & Admin Credentials from .env
    const masterChiefWardenEmail = (process.env.CHIEF_WARDEN_EMAIL || 'warden@university.edu').toLowerCase().trim();
    const masterChiefWardenPassword = process.env.CHIEF_WARDEN_PASSWORD || 'warden123';
    const masterAdminEmail = (process.env.ADMIN_EMAIL || 'admin@university.edu').toLowerCase().trim();
    const masterAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let user: any;
    let role = '';

    // Check Admin Master Credentials
    if (email === masterAdminEmail && password === masterAdminPassword) {
        user = await Admin.findOne({ email });
        if (!user) {
            user = await Admin.create({
                name: 'System Admin',
                email: masterAdminEmail,
                password: masterAdminPassword,
                role: 'admin',
                isActive: true
            });
        }
        role = 'admin';
        
        if (portal === 'student') {
            res.status(403);
            throw new Error('Staff members must use the Admin Portal');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: 'admin',
            profile: user.profile,
            token: generateToken(user._id as unknown as string),
        });
        return;
    }

    // Check Chief Warden Master Credentials
    if (email === masterChiefWardenEmail && password === masterChiefWardenPassword) {
        // Master Chief Warden always goes to Admins collection
        user = await Admin.findOne({ email });
        
        if (!user) {
            user = await Admin.create({
                name: 'Chief Warden',
                email: masterChiefWardenEmail,
                password: masterChiefWardenPassword,
                role: 'chief_warden',
                isActive: true
            });
        }
        role = 'chief_warden';

        if (portal === 'student') {
            res.status(403);
            throw new Error('Staff members must use the Admin Portal');
        }

        // Check if MFA is enabled
        if (user.profile?.isMFAEnabled) {
            res.json({
                mfaRequired: true,
                userId: user._id,
                email: user.email,
                role: 'chief_warden'
            });
            return;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: 'chief_warden',
            profile: user.profile,
            token: generateToken(user._id as unknown as string),
        });
        return;
    } 

    // 2. Standard Login - Check User, Warden, and Admin collections
    user = await User.findOne({ email }).select('+password');
    if (user) role = user.role || 'student';

    if (!user) {
        user = await Warden.findOne({ email }).select('+password');
        if (user) role = user.role;
    }

    if (!user) {
        user = await Admin.findOne({ email }).select('+password');
        if (user) role = user.role;
    }

    if (user && (await user.matchPassword(password))) {
        // Portal restriction check
        if (portal === 'student' && role !== 'student') {
            res.status(403);
            throw new Error('Staff members must use the Admin Portal');
        }
        if (portal === 'admin' && role === 'student') {
            res.status(403);
            throw new Error('Students must use the Student Portal');
        }

        // Check if MFA is enabled
        if (user.profile?.isMFAEnabled) {
            res.json({
                mfaRequired: true,
                userId: user._id,
                email: user.email,
                role: role
            });
            return;
        }

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
        throw new Error('Incorrect password. Please check and try again.');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;
    let user: any;

    if (userRole === 'admin') {
        user = await Admin.findById(userId).select('-password');
    } else if (userRole === 'chief_warden') {
        user = await Admin.findById(userId).select('-password');
        if (!user) {
            user = await Warden.findById(userId).select('-password');
        }
    } else if (userRole === 'warden') {
        user = await Warden.findById(userId).select('-password');
    } else {
        user = await User.findById(userId).select('-password').populate({
            path: 'profile.room',
            populate: [
                { path: 'occupants', select: 'name email profile.studentId' },
                { path: 'block', select: 'name' },
                { path: 'hostel', select: 'name' }
            ]
        });
    }

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: userRole,
            profile: user.profile,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

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

        // Profile Image Change Constraint (Once a month)
        if (profileImage && profileImage !== user.profile.profileImage) {
            const lastUpdate = user.profile.lastProfileUpdate;
            if (lastUpdate) {
                const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
                const timeSinceLastUpdate = Date.now() - new Date(lastUpdate).getTime();
                
                if (timeSinceLastUpdate < thirtyDaysInMs) {
                    const daysRemaining = Math.ceil((thirtyDaysInMs - timeSinceLastUpdate) / (1000 * 60 * 60 * 24));
                    res.status(400);
                    throw new Error(`Profile picture can only be updated once every 30 days. Please try again in ${daysRemaining} days.`);
                }
            }
            user.profile.profileImage = profileImage;
            user.profile.lastProfileUpdate = new Date();
        }

        if (studentId) user.profile.studentId = studentId;
        // ... rest of the fields
        if (course) user.profile.course = course;
        if (year) user.profile.year = parseInt(year);
        if (guardianName) user.profile.guardianName = guardianName;
        if (guardianContact) user.profile.guardianContact = guardianContact;
        if (address) user.profile.address = address;
        if (idProof !== undefined) user.profile.idProof = idProof;
        if (admissionLetter !== undefined) user.profile.admissionLetter = admissionLetter;
        if (gender) user.profile.gender = gender;
        if (branch) user.profile.branch = branch;
        if (relation) user.profile.relation = relation;
        if (guardianContact2) user.profile.guardianContact2 = guardianContact2;
        if (phone) user.profile.phone = phone;
        if (age) user.profile.age = parseInt(age);
        if (applicationNum) user.profile.applicationNum = applicationNum;
        if (aadharNum) user.profile.aadharNum = aadharNum;

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
// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        res.status(404);
        throw new Error('User with this email does not exist');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user profile
    if (!user.profile) user.profile = {};
    user.profile.resetPasswordOTP = otp;
    user.profile.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: 'Smart HMS - Password Reset OTP',
            message: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
            html: getOTPEmail(user.name, otp)
        });
        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('OTP Email failed:', error);
        res.status(500);
        throw new Error('Error sending OTP email');
    }
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
        email: email.toLowerCase().trim(),
        'profile.resetPasswordOTP': otp,
        'profile.resetPasswordExpires': { $gt: new Date() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Update password
    user.password = newPassword;
    
    // Clear OTP fields
    user.profile!.resetPasswordOTP = undefined;
    user.profile!.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
});

// --- MFA ROUTES ---

// @desc    Generate MFA Secret
// @route   POST /api/auth/mfa/generate
// @access  Private
export const generateMFA = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const role = (req as any).user.role;
    let user: any;

    console.log(`[MFA] Starting generation for ${role}: ${userId}`);

    try {
        if (role === 'admin' || role === 'chief_warden') {
            user = await Admin.findById(userId);
        } else if (role === 'warden') {
            user = await Warden.findById(userId);
        } else {
            user = await User.findById(userId);
        }

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email || 'user@shams.hostel', 'Smart HMS', secret);

        if (!user.profile) {
            user.profile = {};
        }
        
        user.profile.mfaSecret = secret;
        await user.save();

        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        res.json({
            secret,
            qrCodeUrl
        });
    } catch (error: any) {
        console.error('[MFA ERROR]:', error.message);
        console.error(error.stack);
        res.status(500);
        throw new Error(error.message || 'MFA Generation failed');
    }
});

// @desc    Enable MFA
// @route   POST /api/auth/mfa/enable
// @access  Private
export const enableMFA = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    const userId = (req as any).user._id;
    const role = (req as any).user.role;
    let user: any;

    if (role === 'admin' || role === 'chief_warden') {
        user = await Admin.findById(userId).select('+profile.mfaSecret');
    } else if (role === 'warden') {
        user = await Warden.findById(userId).select('+profile.mfaSecret');
    } else {
        user = await User.findById(userId).select('+profile.mfaSecret');
    }

    if (!user || !user.profile?.mfaSecret) {
        res.status(400);
        throw new Error('MFA setup not initiated');
    }

    const isValid = await authenticator.verify({
        token,
        secret: user.profile.mfaSecret
    });

    if (!isValid) {
        res.status(400);
        throw new Error('Invalid verification code');
    }

    user.profile.isMFAEnabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully' });
});

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
export const disableMFA = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const role = (req as any).user.role;
    let user: any;

    if (role === 'admin' || role === 'chief_warden') {
        user = await Admin.findById(userId);
    } else if (role === 'warden') {
        user = await Warden.findById(userId);
    } else {
        user = await User.findById(userId);
    }

    if (user && user.profile) {
        user.profile.isMFAEnabled = false;
        user.profile.mfaSecret = undefined;
        await user.save();
        res.json({ message: 'MFA disabled successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Verify MFA Login
// @route   POST /api/auth/mfa/verify
// @access  Public
export const verifyMFALogin = asyncHandler(async (req: Request, res: Response) => {
    const { userId, token, role } = req.body;
    let user: any;

    if (role === 'admin' || role === 'chief_warden') {
        user = await Admin.findById(userId).select('+profile.mfaSecret');
    } else if (role === 'warden') {
        user = await Warden.findById(userId).select('+profile.mfaSecret');
    } else {
        user = await User.findById(userId).select('+profile.mfaSecret');
    }

    if (!user || !user.profile?.mfaSecret) {
        res.status(401);
        throw new Error('Authentication failed');
    }

    const isValid = await authenticator.verify({
        token,
        secret: user.profile.mfaSecret
    });

    if (!isValid) {
        res.status(401);
        throw new Error('Invalid verification code');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        profile: user.profile,
        token: generateToken(user._id as unknown as string),
    });
});

// ============================================
// INITIATE SSO (PASSWORDLESS MFA)
// ============================================
export const initiateSSO = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    // Check in all role collections
    const admin = await Admin.findOne({ email });
    const warden = await Warden.findOne({ email });
    const user = admin || warden;

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.profile?.isMFAEnabled) {
        res.status(400);
        throw new Error('MFA is not enabled for this account. Please login with password first.');
    }

    const role = admin ? 'admin' : 'warden';

    res.json({
        userId: user._id,
        role: role,
        message: 'MFA Verification required'
    });
});
