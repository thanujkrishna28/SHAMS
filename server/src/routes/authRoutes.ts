import express from 'express';
import { 
    registerUser, loginUser, getUserProfile, updateUserProfile, 
    updateMealPreference, requestOTP, resetPassword,
    generateMFA, enableMFA, disableMFA, verifyMFALogin, initiateSSO
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import passport from 'passport';
import generateToken from '../utils/generateToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/meal-preference', protect, updateMealPreference);
router.post('/forgot-password', requestOTP);
router.post('/reset-password', resetPassword);

// MFA Routes
router.post('/mfa/generate', protect, generateMFA);
router.post('/mfa/enable', protect, enableMFA);
router.post('/mfa/disable', protect, disableMFA);
router.post('/mfa/verify', verifyMFALogin);
router.post('/mfa/initiate-sso', initiateSSO);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req: any, res) => {
        const user = req.user;
        const token = generateToken(user._id);
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);

export default router;
