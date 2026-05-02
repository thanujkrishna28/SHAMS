import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getWeeklyMenu,
    updateWeeklyMenu,
    submitFeedback,
    getFeedback,
    deleteFeedback,
    updateDayMenu
} from '../controllers/messController';

const router = express.Router();

router.route('/menu').get(getWeeklyMenu).put(protect, authorize('admin', 'chief_warden'), updateWeeklyMenu);
router.route('/menu/:day').put(protect, authorize('admin', 'chief_warden'), updateDayMenu);

router.route('/feedback')
    .post(protect, submitFeedback)
    .get(protect, getFeedback);

router.route('/feedback/:id').delete(protect, authorize('admin', 'chief_warden'), deleteFeedback);

export default router;
