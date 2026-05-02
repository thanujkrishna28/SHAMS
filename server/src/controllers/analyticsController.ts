import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import AttendanceLog from '../models/AttendanceLog';
import Fee from '../models/Fee';
import Complaint from '../models/Complaint';
import Event from '../models/Event';
import Parcel from '../models/Parcel';

// @desc    Get student dashboard analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
export const getStudentAnalytics = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user._id;

    // 1. Attendance Trends (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceLogs = await AttendanceLog.find({
        student: studentId,
        createdAt: { $gte: thirtyDaysAgo }
    });

    const presentCount = attendanceLogs.filter(l => l.type === 'present' || l.type === 'entry').length;
    const attendancePercentage = (presentCount / 30) * 100; // Simplified logic

    // 2. Spending (Total Paid Fees)
    const fees = await Fee.find({ student: studentId });
    const totalSpent = fees.reduce((acc, fee) => acc + fee.paidAmount, 0);
    const balance = fees.reduce((acc, fee) => acc + fee.balanceAmount, 0);

    // 3. Activity Counts
    const pendingComplaints = await Complaint.countDocuments({ student: studentId, status: { $ne: 'resolved' } });
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });
    const pendingParcels = await Parcel.countDocuments({ student: studentId, status: 'received' });

    res.json({
        attendance: {
            percentage: Math.min(attendancePercentage, 100).toFixed(1),
            totalLogs: attendanceLogs.length
        },
        spending: {
            total: totalSpent,
            balance: balance
        },
        stats: {
            pendingComplaints,
            upcomingEvents,
            pendingParcels
        }
    });
});
