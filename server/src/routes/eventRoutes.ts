import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getEvents, createEvent, attendEvent } from '../controllers/eventController';

const router = express.Router();

router.get('/', protect, getEvents);
router.post('/', protect, authorize('admin', 'warden'), createEvent);
router.post('/:id/attend', protect, authorize('student'), attendEvent);

export default router;
