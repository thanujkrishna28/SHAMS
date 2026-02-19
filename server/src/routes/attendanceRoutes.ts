import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getMyQRCode,
    scanQRCode,
    getMyAttendance,
} from '../controllers/attendanceController';

const router = express.Router();

router.route('/qr-code')
    .get(protect, getMyQRCode);

router.route('/my')
    .get(protect, getMyAttendance);

router.route('/scan')
    .post(protect, authorize('admin', 'security'), scanQRCode);

export default router;
