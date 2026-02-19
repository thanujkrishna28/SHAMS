import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { generateWeeklyReport } from '../controllers/reportController';

const router = express.Router();

router.get('/weekly', protect, admin, generateWeeklyReport);

export default router;
