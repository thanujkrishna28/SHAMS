import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getAdminStats, getStudents, verifyStudent, getAuditLogs } from '../controllers/adminController';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'chief_warden'), getAdminStats);
router.get('/students', protect, authorize('admin', 'chief_warden', 'warden'), getStudents);
router.put('/students/:id/verify', protect, authorize('admin', 'chief_warden', 'warden'), verifyStudent);
router.get('/audit-logs', protect, authorize('admin', 'chief_warden'), getAuditLogs);

export default router;
