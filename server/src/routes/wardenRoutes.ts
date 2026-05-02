import express from 'express';
import { createWarden, getAllWardens } from '../controllers/wardenController';
import { protect, chiefWarden } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, chiefWarden, createWarden)
    .get(protect, chiefWarden, getAllWardens);

export default router;
