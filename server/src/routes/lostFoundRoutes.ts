import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    reportItem,
    getItems,
    resolveItem,
    deleteItem
} from '../controllers/lostFoundController';

const router = express.Router();

router.route('/')
    .get(protect, getItems)
    .post(protect, reportItem);

router.route('/:id')
    .patch(protect, resolveItem)
    .delete(protect, deleteItem);

export default router;
