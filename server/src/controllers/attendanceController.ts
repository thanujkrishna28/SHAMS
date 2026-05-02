import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import AttendanceLog from '../models/AttendanceLog';
import Room from '../models/Room';
import Block from '../models/Block';
import { createNotification } from './notificationController';
import sendEmail from '../utils/sendEmail';
import { getAttendanceEmail } from '../utils/emailTemplates';

// @desc    Get rooms assigned to Warden's hostel
// @route   GET /api/attendance/warden/rooms
// @access  Private (Warden)
export const getWardenRooms = asyncHandler(async (req: any, res: Response) => {
    const warden = req.user; // Already populated from correct collection by protect middleware
    if (!warden || !['warden', 'chief_warden'].includes(warden.role)) {
        res.status(403);
        throw new Error('Access denied. Wardens only.');
    }

    const hostelId = warden.profile?.hostel;
    if (!hostelId) {
        res.status(400);
        throw new Error('No hostel assigned to this Warden.');
    }

    let query: any = { hostel: hostelId };
    
    // If Chief Warden, filter by their assigned block name if it exists
    if (warden.role === 'chief_warden' && warden.profile?.block) {
        // Find block ID from name
        const block = await Block.findOne({ 
            name: warden.profile.block, 
            hostel: hostelId 
        });
        if (block) {
            query.block = block._id;
        }
    }

    const rooms = await Room.find(query)
        .populate('occupants', 'name profile.profileImage profile.studentId')
        .sort({ roomNumber: 1 });

    res.json(rooms);
});

// @desc    Mark attendance for a specific room (Manual Round)
// @route   POST /api/attendance/warden/mark-room
// @access  Private (Warden)
export const markRoomAttendance = asyncHandler(async (req: any, res: Response) => {
    const { roomId, attendanceData } = req.body; 
    // attendanceData: Array<{ studentId: string, status: 'present' | 'absent' }>

    const warden = req.user;
    if (!warden || !['warden', 'chief_warden'].includes(warden.role)) {
        res.status(403);
        throw new Error('Access denied. Wardens only.');
    }

    const room = await Room.findById(roomId);
    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    const logs = [];

    for (const item of attendanceData) {
        const student = await User.findById(item.studentId);
        if (!student) continue;

        const log = await AttendanceLog.create({
            student: student._id,
            type: item.status,
            location: warden.profile?.block || 'Hostel Block',
            room: roomId,
            scannedBy: warden._id,
        });

        logs.push(log);

        // Update student's "isInside" status for status-based control
        if (student.profile) {
            student.profile.isInside = (item.status === 'present');
            student.profile.lastMovementAt = new Date();
            await student.save();
        }

        // Notify student
        await createNotification(
            student._id.toString(),
            `Night Attendance Marked`,
            `Your attendance was marked as ${item.status.toUpperCase()} by Warden ${warden.name}.`,
            item.status === 'present' ? 'success' : 'warning'
        );

        // Optional: Email notification for absence
        if (item.status === 'absent') {
            try {
                const time = new Date().toLocaleString();
                const html = getAttendanceEmail(
                    student.name,
                    'absence',
                    time,
                    room.roomNumber,
                    'ABSENT'
                );

                await sendEmail({
                    email: student.email,
                    subject: `Smart HMS: Absence Recorded`,
                    message: `Hi ${student.name}, You were marked ABSENT by the Warden during the night round at ${time}.`,
                    html
                });
            } catch (e) { }
        }
    }

    res.json({
        success: true,
        message: `Attendance marked for Room ${room.roomNumber}`,
        count: logs.length
    });
});

// @desc    Get attendance summary for Chief Warden
// @route   GET /api/attendance/chief/summary
// @access  Private (Chief Warden/Admin)
export const getChiefWardenStats = asyncHandler(async (req: any, res: Response) => {
    // Current date range (Today's night round)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    const presentLogs = await AttendanceLog.find({
        type: 'present',
        createdAt: { $gte: start, $lte: end }
    }).distinct('student');

    const absentLogs = await AttendanceLog.find({
        type: 'absent',
        createdAt: { $gte: start, $lte: end }
    }).distinct('student');

    res.json({
        totalStudents,
        presentCount: presentLogs.length,
        absentCount: absentLogs.length,
        pendingCount: totalStudents - (presentLogs.length + absentLogs.length),
        absentees: await User.find({
            _id: { $in: absentLogs }
        }).select('name email profile.roomNumber profile.profileImage profile.studentId')
    });
});

// @desc    Get student's own attendance history
// @route   GET /api/attendance/my
// @access  Private (Student)
export const getMyAttendance = asyncHandler(async (req: any, res: Response) => {
    const logs = await AttendanceLog.find({ student: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30);
    res.json(logs);
});
