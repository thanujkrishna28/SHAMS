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
    .get(protect, authorize('admin'), getAllComplaints)
    .post(protect, createComplaint);

router.route('/my')
    .get(protect, getMyComplaints);

router.route('/:id')
    .put(protect, authorize('admin'), updateComplaintStatus);

export default router;
