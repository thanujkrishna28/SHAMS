import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getAdminStats, getStudents, verifyStudent } from '../controllers/adminController';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/students', protect, authorize('admin'), getStudents);
router.put('/students/:id/verify', protect, authorize('admin'), verifyStudent);

export default router;
