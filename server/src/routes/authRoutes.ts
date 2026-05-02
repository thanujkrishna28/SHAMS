import express from 'express';
import { 
    registerUser, loginUser, getUserProfile, updateUserProfile, 
    updateMealPreference, requestOTP, resetPassword,
    generateMFA, enableMFA, disableMFA, verifyMFALogin, initiateSSO
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

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

export default router;
