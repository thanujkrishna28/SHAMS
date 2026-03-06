import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    receiveParcel,
    getParcels,
    getMyParcels,
    deliverParcel
} from '../controllers/parcelController';

const router = express.Router();

router.get('/', protect, authorize('admin', 'security'), getParcels);
router.post('/', protect, authorize('admin', 'security'), receiveParcel);
router.get('/my', protect, getMyParcels);
router.post('/:id/deliver', protect, authorize('admin', 'security'), deliverParcel);

export default router;
