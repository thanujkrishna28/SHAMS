import express from 'express';
import {
    createOrder,
    markOfflinePaid,
    getMyFee,
    getAllFees,
    adminCreateFee,
    simulateSuccess,
    downloadReceipt,
    verifyPayment,
} from '../controllers/paymentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Student Routes
router.post('/create-order', protect, authorize('student'), createOrder);
router.post('/verify', protect, authorize('student'), verifyPayment);
router.get('/my-fee', protect, authorize('student'), getMyFee);
router.get('/receipt/:feeId', protect, downloadReceipt);
router.post('/simulate-success', protect, simulateSuccess); // Keep for dev testing

// Admin & Chief Warden Routes
router.get('/all', protect, authorize('admin', 'chief_warden'), getAllFees);
router.post('/create', protect, authorize('admin', 'chief_warden'), adminCreateFee);
router.post('/offline-pay', protect, authorize('admin', 'chief_warden'), markOfflinePaid);

export default router;
