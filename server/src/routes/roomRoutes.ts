import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getRooms,
    getRoomById,
    createRoom,
    createBulkRooms,
    updateRoom,
    deleteRoom,
    lockRoom
} from '../controllers/roomController';

const router = express.Router();

router.route('/')
    .get(protect, getRooms) // Allow students to view rooms too? Usually yes for allocation.
    .post(protect, authorize('admin'), createRoom);

router.post('/bulk', protect, authorize('admin'), createBulkRooms);

router.route('/:id')
    .get(protect, getRoomById)
    .put(protect, authorize('admin'), updateRoom)
    .delete(protect, authorize('admin'), deleteRoom);

router.post('/:id/lock', protect, lockRoom);

export default router;
