import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getMachines,
    bookMachine,
    getMyLaundryBookings,
    updateMachineStatus
} from '../controllers/laundryController';

const router = express.Router();

router.get('/machines', protect, getMachines);
router.post('/book', protect, authorize('student'), bookMachine);
router.get('/my-bookings', protect, authorize('student'), getMyLaundryBookings);
router.patch('/machines/:id', protect, authorize('admin'), updateMachineStatus);

export default router;
