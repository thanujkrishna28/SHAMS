import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
    getWeeklyMenu,
    updateWeeklyMenu,
    submitFeedback,
    getFeedback,
    deleteFeedback,
    updateDayMenu
} from '../controllers/messController';

const router = express.Router();

router.route('/menu').get(getWeeklyMenu).put(protect, admin, updateWeeklyMenu);
router.route('/menu/:day').put(protect, admin, updateDayMenu);

router.route('/feedback')
    .post(protect, submitFeedback)
    .get(protect, getFeedback);

router.route('/feedback/:id').delete(protect, admin, deleteFeedback);

export default router;
