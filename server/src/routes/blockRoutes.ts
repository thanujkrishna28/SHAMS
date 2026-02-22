import express from 'express';
import {
    getBlocks,
    createBlock,
    deleteBlock
} from '../controllers/blockController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getBlocks)
    .post(protect, admin, createBlock);

router.route('/:id')
    .delete(protect, admin, deleteBlock);

export default router;
