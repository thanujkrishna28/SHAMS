import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getStudentAnalytics } from '../controllers/analyticsController';

const router = express.Router();

router.get('/student', protect, authorize('student'), getStudentAnalytics);

export default router;
