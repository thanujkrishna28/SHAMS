import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import AttendanceLog from '../models/AttendanceLog';
import UsedToken from '../models/UsedToken';
import { generateShortToken } from '../utils/generateToken';
import sendEmail from '../utils/sendEmail';
import jwt from 'jsonwebtoken';
import { createNotification } from './notificationController';

// @desc    Get dynamic QR code payload (Student)
// @route   GET /api/attendance/qr-code
// @access  Private (Student)
export const getMyQRCode = asyncHandler(async (req: any, res: Response) => {
    // Get user from DB to check deviceId
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Identify current device (simplified for web/demo- in real mobile app, device-id is passed in headers)
    const currentDeviceId = req.headers['x-device-id'] as string || 'default-browser-device';

    // Device Binding Logic
    if (user.profile) {
        if (!user.profile.deviceId) {
            // Bind on first use
            user.profile.deviceId = currentDeviceId;
            await user.save();
        } else if (user.profile.deviceId !== currentDeviceId) {
            res.status(403);
            throw new Error('QR generation restricted to registered device. Contact Admin.');
        }
    }

    // Generate token with device fingerprint and JTI
    const token = generateShortToken(req.user._id, 'entry-exit', currentDeviceId);

    res.json({
        token,
        validUntil: new Date(Date.now() + 30000)
    });
});

// @desc    Scan QR Code (Guard/Admin)
// @route   POST /api/attendance/scan
// @access  Private (Admin/Security)
export const scanQRCode = asyncHandler(async (req: any, res: Response) => {
    const { qrToken, location, coords } = req.body; // coords: { lat, lng }

    if (!qrToken) {
        res.status(400);
        throw new Error('QR Token is required');
    }

    // 1. Verify JWT
    let decoded: any;
    try {
        decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'secret');
    } catch (e) {
        res.status(400);
        throw new Error('Invalid or Expired QR Code');
    }

    // 2. Check JTI (Nonce) for Replay Attack
    const tokenUsed = await UsedToken.findOne({ jti: decoded.jti });
    if (tokenUsed) {
        res.status(400);
        throw new Error('QR Code already used');
    }

    // 3. Directional Logic & User Validation
    const student = await User.findById(decoded.id);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // 4. Device Binding Check (Server Side)
    if (student.profile?.deviceId !== decoded.deviceId) {
        res.status(400);
        throw new Error('Fraud Detected: QR from unauthorized device');
    }

    // 5. Geo-Fencing (Mock)
    // In production, compare 'coords' with Gate coordinates
    // if (distance(coords, GATE_COORDS) > 100) throw Error('Not at Gate');

    const currentlyInside = student.profile?.isInside !== false; // Default true

    // Direction logic (Entry logic)
    // If scanning for Entry (coming from Outside): isInside must be false
    // If scanning for Exit (going from Inside): isInside must be true
    // However, if we want a generic scanner:
    const newStatus = !currentlyInside;

    // 6. Record Attendance
    await AttendanceLog.create({
        student: student._id,
        type: newStatus ? 'entry' : 'exit',
        location: location || 'Main Gate',
        scannedBy: req.user._id,
    });

    // 7. Update User State
    if (student.profile) {
        student.profile.isInside = newStatus;
        student.profile.lastMovementAt = new Date();
        await student.save();
    }

    // 8. Invalidate Token (Blacklist JTI)
    await UsedToken.create({
        jti: decoded.jti,
        expiresAt: new Date(Date.now() + 60000) // Keep in blacklist for 1 min
    });

    // 9. Alerting for Abnormal behavior (Audit Log placeholder)
    if (student.profile?.lastMovementAt && (Date.now() - new Date(student.profile.lastMovementAt).getTime() < 5000)) {
        console.warn(`WARNING: Rapid movement detected for ${student.name}`);
        // Flag for review
    }

    // Notify student via Push/Socket
    await createNotification(
        student._id.toString(),
        `Attendance ${newStatus ? 'Entry' : 'Exit'}`,
        `Your ${newStatus ? 'entry to' : 'exit from'} the hostel was successful at ${location || 'Main Gate'}.`,
        newStatus ? 'success' : 'info'
    );

    // Notify student via Email
    try {
        await sendEmail({
            email: student.email,
            subject: `Smart HMS: ${newStatus ? 'Entry' : 'Exit'} Recorded`,
            message: `Hi ${student.name},\n\nYour ${newStatus ? 'entry' : 'exit'} at ${location || 'Main Gate'} was successful.\n\nTime: ${new Date().toLocaleString()}\nStatus: ${newStatus ? 'IN HOSTEL' : 'OUTSIDE'}`,
        });
    } catch (e) { }

    res.json({
        success: true,
        message: `${newStatus ? 'Entry' : 'Exit'} recorded for ${student.name}`,
        student: {
            name: student.name,
            id: student.profile?.studentId,
            status: newStatus ? 'Inside' : 'Outside'
        }
    });
});

export const getMyAttendance = asyncHandler(async (req: any, res: Response) => {
    const logs = await AttendanceLog.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(logs);
});
