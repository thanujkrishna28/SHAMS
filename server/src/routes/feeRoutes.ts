import express from 'express';
import { getMyFees, getAllFees, createFee, markFeePaid } from '../controllers/feeController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/my', getMyFees);
router.get('/', admin, getAllFees);
router.post('/', admin, createFee);
router.put('/:id/pay', markFeePaid);

export default router;
