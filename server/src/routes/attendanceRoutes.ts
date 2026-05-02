import express from 'express';
import { protect, warden, chiefWarden } from '../middleware/authMiddleware';
import {
    getWardenRooms,
    markRoomAttendance,
    getChiefWardenStats,
    getMyAttendance,
} from '../controllers/attendanceController';

const router = express.Router();

// Student Routes
router.get('/my', protect, getMyAttendance);

// Warden Routes
router.get('/warden/rooms', protect, warden, getWardenRooms);
router.post('/warden/mark-room', protect, warden, markRoomAttendance);

// Chief Warden / Admin Routes
router.get('/chief/summary', protect, chiefWarden, getChiefWardenStats);

export default router;
