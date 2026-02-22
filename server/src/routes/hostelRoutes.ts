import express from 'express';
import {
    getHostels,
    createHostel,
    updateHostel,
    deleteHostel
} from '../controllers/hostelController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getHostels)
    .post(protect, admin, createHostel);

router.route('/:id')
    .put(protect, admin, updateHostel)
    .delete(protect, admin, deleteHostel);

export default router;
