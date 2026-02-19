import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    requestAllocation,
    getMyAllocations,
    getAllAllocations,
    updateAllocationStatus
} from '../controllers/allocationController';

const router = express.Router();

router.route('/')
    .post(protect, requestAllocation)
    .get(protect, authorize('admin'), getAllAllocations);

router.route('/my')
    .get(protect, getMyAllocations);

router.route('/:id/status')
    .put(protect, authorize('admin'), updateAllocationStatus);

export default router;
