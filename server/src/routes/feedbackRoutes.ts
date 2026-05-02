import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { submitFeedback, getWardenFeedback } from '../controllers/feedbackController';

const router = express.Router();

router.post('/', protect, authorize('student'), submitFeedback);
router.get('/warden/:id', protect, authorize('admin'), getWardenFeedback);

export default router;
