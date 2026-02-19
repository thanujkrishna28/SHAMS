import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, updateMealPreference } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/meal-preference', protect, updateMealPreference);

export default router;
