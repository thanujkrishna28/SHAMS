import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
} from '../controllers/complaintController';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'warden', 'chief_warden'), getAllComplaints)
    .post(protect, createComplaint);

router.route('/my')
    .get(protect, getMyComplaints);

router.route('/:id')
    .put(protect, authorize('admin', 'warden', 'chief_warden'), updateComplaintStatus);

export default router;
