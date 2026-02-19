import express from 'express';
import { protect, admin, security, authorize } from '../middleware/authMiddleware';
import { registerVisitor, getMyVisitors, getAllVisitors, updateVisitorStatus } from '../controllers/visitorController';

const router = express.Router();

router.route('/')
    .post(protect, registerVisitor)
    .get(protect, (req: any, res, next) => {
        if (req.user.role === 'admin' || req.user.role === 'security') {
            return getAllVisitors(req, res, next);
        } else {
            return getMyVisitors(req, res, next);
        }
    });

router.route('/:id').put(protect, authorize('admin', 'security'), updateVisitorStatus);

export default router;
