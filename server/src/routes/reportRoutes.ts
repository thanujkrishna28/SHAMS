import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { generateWeeklyReport, generateAuditReport } from '../controllers/reportController';

const router = express.Router();

router.get('/weekly', protect, admin, generateWeeklyReport);
router.get('/audit', protect, admin, generateAuditReport);

export default router;
