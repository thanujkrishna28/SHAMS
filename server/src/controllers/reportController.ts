import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PDFDocument from 'pdfkit';
import User from '../models/User';
import Room from '../models/Room';
import Complaint from '../models/Complaint';
import Allocation from '../models/Allocation';
import AttendanceLog from '../models/AttendanceLog';
import Visitor from '../models/Visitor';
import AuditLog from '../models/AuditLog';

// @desc    Generate Weekly Report PDF
// @route   GET /api/reports/weekly
// @access  Private (Admin)
export const generateWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
    const doc = new PDFDocument();

    const filename = `Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(25).text('Smart Hostel Management System', { align: 'center' });
    doc.fontSize(16).text('Weekly Operational Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);

    // 1. General Stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRooms = await Room.countDocuments({});
    const totalComplaints = await Complaint.countDocuments({});
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });

    doc.fontSize(18).text('Overview', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Students: ${totalStudents}`);
    doc.text(`Total Rooms: ${totalRooms}`);
    doc.text(`Total Complaints: ${totalComplaints}`);
    doc.text(`Pending Complaints: ${pendingComplaints}`);
    doc.moveDown();

    // 2. Complaint Stats (Last 7 Days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentComplaints = await Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    doc.fontSize(18).text('Complaints (Last 7 Days)', { underline: true });
    doc.fontSize(12);
    doc.text(`New Complaints: ${recentComplaints}`);
    doc.moveDown();

    // 3. Attendance Overview
    const recentAttendance = await AttendanceLog.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        type: 'entry'
    });

    doc.fontSize(18).text('Attendance Activity', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Entry Scans (Last 7 Days): ${recentAttendance}`);
    doc.moveDown();

    // 4. Visitors
    const activeVisitors = await Visitor.countDocuments({ status: 'checked-in' });
    const weeklyVisitors = await Visitor.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    doc.fontSize(18).text('Visitor Management', { underline: true });
    doc.fontSize(12);
    doc.text(`Currently Active Visitors: ${activeVisitors}`);
    doc.text(`Visitors registered this week: ${weeklyVisitors}`);
    doc.moveDown();

    // Footer
    const centerY = doc.page.height - 50;
    doc.fontSize(10).text('Confidential Report - Internal Use Only', 50, centerY, { align: 'center', width: doc.page.width - 100 });

    doc.end();
});

// @desc    Generate Audit Report PDF
// @route   GET /api/reports/audit
// @access  Private (Admin)
export const generateAuditReport = asyncHandler(async (req: Request, res: Response) => {
    const doc = new PDFDocument({ margin: 30 });
    const filename = `Audit_Log_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('SHAMS - Administrative Audit Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const logs = await AuditLog.find()
        .populate('admin', 'name')
        .sort({ createdAt: -1 })
        .limit(100); // Last 100 logs for the PDF

    // Table Header
    const tableTop = 150;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 30, tableTop);
    doc.text('Admin', 120, tableTop);
    doc.text('Action', 220, tableTop);
    doc.text('Details', 320, tableTop);
    
    doc.moveDown();
    doc.moveTo(30, doc.y).lineTo(580, doc.y).stroke();
    doc.moveDown();

    doc.font('Helvetica').fontSize(8);
    logs.forEach(log => {
        const dateStr = new Date(log.createdAt).toLocaleString();
        const adminName = (log.admin as any)?.name || 'System';
        
        doc.text(dateStr, 30, doc.y, { width: 80 });
        doc.text(adminName, 120, doc.y - 10, { width: 90 });
        doc.text(log.action, 220, doc.y - 10, { width: 90 });
        doc.text(log.details || '-', 320, doc.y - 10, { width: 250 });
        doc.moveDown(1.5);

        if (doc.y > 700) {
            doc.addPage();
            doc.y = 50;
        }
    });

    doc.end();
});
