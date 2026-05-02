import express from 'express';
import {
    getRegisterOptions,
    verifyRegistration,
    getLoginOptions,
    verifyLogin,
} from '../controllers/webauthnController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Registration (Requires login first to link device)
router.post('/register-options', protect, getRegisterOptions);
router.post('/register-verify', protect, verifyRegistration);

// Authentication (Login)
router.post('/login-options', getLoginOptions);
router.post('/login-verify', verifyLogin);

export default router;
