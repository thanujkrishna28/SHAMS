import express from 'express';
import { protect, chiefWarden } from '../middleware/authMiddleware';
import {
    getRooms,
    getRoomById,
    createRoom,
    createBulkRooms,
    createSmartBatch,
    updateRoom,
    deleteRoom,
    lockRoom,
    unlockRoom,
    getRoomRecommendation
} from '../controllers/roomController';

const router = express.Router();

router.route('/')
    .get(protect, getRooms) 
    .post(protect, chiefWarden, createRoom);

router.post('/bulk', protect, chiefWarden, createBulkRooms);
router.post('/smart-batch', protect, chiefWarden, createSmartBatch);
router.post('/recommendation', protect, getRoomRecommendation);

router.route('/:id')
    .get(protect, getRoomById)
    .put(protect, chiefWarden, updateRoom)
    .delete(protect, chiefWarden, deleteRoom);

router.post('/:id/lock', protect, chiefWarden, lockRoom);
router.post('/:id/unlock', protect, chiefWarden, unlockRoom);

export default router;
