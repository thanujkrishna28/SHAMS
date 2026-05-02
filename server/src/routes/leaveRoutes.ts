import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} from '../controllers/leaveController';

const router = express.Router();

router.route('/')
    .post(protect, authorize('student'), applyLeave)
    .get(protect, authorize('admin', 'chief_warden'), getAllLeaves);

router.route('/my').get(protect, authorize('student'), getMyLeaves);

router.route('/:id').put(protect, authorize('admin', 'chief_warden'), updateLeaveStatus);

export default router;
