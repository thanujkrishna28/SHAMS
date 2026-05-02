import express from 'express';
import { protect, admin, security, authorize } from '../middleware/authMiddleware';
import { registerVisitor, getMyVisitors, getAllVisitors, updateVisitorStatus } from '../controllers/visitorController';

const router = express.Router();

router.route('/')
    .post(protect, registerVisitor)
    .get(protect, (req: any, res, next) => {
        if (['admin', 'security', 'warden', 'chief_warden'].includes(req.user.role)) {
            return getAllVisitors(req, res, next);
        } else {
            return getMyVisitors(req, res, next);
        }
    });

router.route('/:id').put(protect, authorize('admin', 'security', 'warden', 'chief_warden'), updateVisitorStatus);

export default router;
