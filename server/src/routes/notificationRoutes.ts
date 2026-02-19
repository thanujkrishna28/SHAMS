import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

export default router;
