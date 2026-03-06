import express from 'express';
import {
    createOrder,
    handleWebhook,
    getFeeStatus,
    markOfflinePaid,
    getMyFee,
    getAllFees,
    adminCreateFee,
    simulateSuccess,
    verifyPayment
} from '../controllers/paymentController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public webhook
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/simulate-success', protect, simulateSuccess);
router.get('/my-fee', protect, getMyFee);
router.get('/status/:feeId', protect, getFeeStatus);
router.get('/all', protect, admin, getAllFees);
router.post('/create', protect, admin, adminCreateFee);
router.post('/offline-pay', protect, admin, markOfflinePaid);



export default router;
