import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getMachines,
    bookMachine,
    getMyLaundryBookings,
    updateMachineStatus
} from '../controllers/laundryController';
import { getMyLaundry, addLaundryLog, updateLaundryStatus } from '../controllers/laundryController';

const router = express.Router();

router.get('/machines', protect, getMachines);
router.post('/book', protect, authorize('student'), bookMachine);
router.get('/my-bookings', protect, authorize('student'), getMyLaundryBookings);
router.patch('/machines/:id', protect, authorize('admin'), updateMachineStatus);

// Tracking Routes
router.get('/my', protect, authorize('student'), getMyLaundry);
router.post('/track', protect, authorize('warden', 'admin'), addLaundryLog);
router.put('/track/:id', protect, authorize('warden', 'admin'), updateLaundryStatus);

export default router;
