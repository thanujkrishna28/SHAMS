import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';

const router = express.Router();

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, authorize('admin'), createAnnouncement);

export default router;
