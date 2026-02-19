import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Room from '../models/Room';
import Complaint from '../models/Complaint';
import Allocation from '../models/Allocation';
import mongoose from 'mongoose';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
import AttendanceLog from '../models/AttendanceLog';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Occupancy
    const rooms = await Room.find({});
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const totalOccupants = rooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;

    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const pendingAllocations = await Allocation.countDocuments({ status: 'pending' });

    // Block-wise occupancy
    const blocks = [...new Set(rooms.map(r => r.block))].sort();
    const blockStats = blocks.map(block => {
        const blockRooms = rooms.filter(r => r.block === block);
        const capacity = blockRooms.reduce((acc, r) => acc + r.capacity, 0);
        const occupants = blockRooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
        return {
            block,
            percentage: capacity > 0 ? Math.round((occupants / capacity) * 100) : 0
        };
    });

    // Complaint Resolution Time (Average hours)
    const resolvedComplaints = await Complaint.find({ status: 'resolved' }).select('createdAt updatedAt');
    let avgComplaintResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
        const totalDuration = resolvedComplaints.reduce((acc, c) => {
            return acc + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime());
        }, 0);
        avgComplaintResolutionTime = Math.round((totalDuration / resolvedComplaints.length) / (1000 * 60 * 60)); // Hours
    }

    // Allocation Processing Time (Average hours)
    const processedAllocations = await Allocation.find({ status: { $in: ['approved', 'rejected'] } }).select('createdAt updatedAt');
    let avgAllocationProcessingTime = 0;
    if (processedAllocations.length > 0) {
        const totalDuration = processedAllocations.reduce((acc, a) => {
            return acc + (new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime());
        }, 0);
        avgAllocationProcessingTime = Math.round((totalDuration / processedAllocations.length) / (1000 * 60 * 60));
    }

    // Daily Attendance Trend (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const attendanceTrend = await Promise.all(last7Days.map(async (date) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const count = await AttendanceLog.countDocuments({
            createdAt: { $gte: start, $lte: end },
            type: 'entry' // Assuming entry scans as valid attendance
        });

        return { date, count };
    }));

    // Meal stats
    const mealStats = await User.aggregate([
        { $match: { role: 'student' } },
        {
            $group: {
                _id: '$profile.mealPreference',
                count: { $sum: 1 }
            }
        }
    ]);

    // Visitor stats (Pending)
    const pendingVisitors = await mongoose.model('Visitor').countDocuments({ status: 'pending' });

    // Late Arrivals (Last 7 days, after 10 PM)
    const lateArrivals = await AttendanceLog.countDocuments({
        type: 'entry',
        createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        $expr: { $gte: [{ $hour: "$createdAt" }, 22] } // 10 PM
    });

    // Low Attendance (Students not seen in last 3 days)
    // Complex query omitted for brevity, using simple placeholder or simple "students inside" logic
    // Actually, "Students rarely staying" -> maybe check low attendance percentage if we tracked it
    // For now, let's just return "Students currently OUT"
    const studentsOut = await User.countDocuments({ role: 'student', 'profile.isInside': false });

    res.json({
        totalStudents,
        occupancyRate,
        pendingComplaints,
        pendingAllocations,
        pendingVisitors,
        blockStats,
        avgComplaintResolutionTime,
        avgAllocationProcessingTime,
        attendanceTrend,
        mealStats: mealStats.reduce((acc: any, curr: any) => ({ ...acc, [curr._id || 'Not Set']: curr.count }), {}),
        lateArrivals,
        studentsOut
    });
});

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // High limit to be backward compatible mostly
    const skip = (page - 1) * limit;

    const { search, role, verified } = req.query;

    let query: any = { role: 'student' };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (verified === 'true') {
        query['profile.isVerified'] = true;
    } else if (verified === 'false') {
        query['profile.isVerified'] = false;
    }

    const total = await User.countDocuments(query);
    const students = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        data: students,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Verify student profile
// @route   PUT /api/admin/students/:id/verify
// @access  Private (Admin)
export const verifyStudent = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (!user.profile) user.profile = {};

        user.profile.isVerified = true;
        // Optionally send email here

        await user.save();
        res.json({ message: 'Student verified successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
