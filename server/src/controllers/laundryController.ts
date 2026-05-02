import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import LaundryMachine from '../models/LaundryMachine';
import LaundryBooking from '../models/LaundryBooking';
import Laundry from '../models/Laundry';
import { createNotification } from './notificationController';

// @desc    Get all laundry machines
// @route   GET /api/laundry/machines
// @access  Private
export const getMachines = asyncHandler(async (req: any, res: Response) => {
    const machines = await LaundryMachine.find({});
    res.json(machines);
});

// @desc    Book a laundry slot
// @route   POST /api/laundry/book
// @access  Private (Student)
export const bookMachine = asyncHandler(async (req: any, res: Response) => {
    const { machineId, duration } = req.body; // duration in minutes

    const machine = await LaundryMachine.findById(machineId);
    if (!machine) {
        res.status(404);
        throw new Error('Machine not found');
    }

    if (machine.status !== 'Available') {
        res.status(400);
        throw new Error('Machine is currently unavailable or busy');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const booking = await LaundryBooking.create({
        student: req.user._id,
        machine: machineId,
        startTime,
        endTime,
        duration,
        status: 'Scheduled'
    });

    // Update machine status
    machine.status = 'Running';
    machine.currentBooking = booking._id as any;
    await machine.save();

    res.status(201).json(booking);
});

// @desc    Get my bookings
// @route   GET /api/laundry/my-bookings
// @access  Private (Student)
export const getMyLaundryBookings = asyncHandler(async (req: any, res: Response) => {
    const bookings = await LaundryBooking.find({ student: req.user._id })
        .populate('machine')
        .sort({ createdAt: -1 });
    res.json(bookings);
});

// @desc    Admin: Update machine status (Internal use for maintenance or cleaning)
// @route   PATCH /api/laundry/machines/:id
// @access  Private (Admin)
export const updateMachineStatus = asyncHandler(async (req: any, res: Response) => {
    const { status } = req.body;
    const machine = await LaundryMachine.findById(req.params.id);

    if (!machine) {
        res.status(404);
        throw new Error('Machine not found');
    }

    machine.status = status;
    if (status === 'Available') {
        machine.currentBooking = undefined;
    }
    await machine.save();

    res.json(machine);
});

// --- Tracking Logic ---

// @desc    Get my laundry logs
// @route   GET /api/laundry/my
// @access  Private (Student)
export const getMyLaundry = asyncHandler(async (req: any, res: Response) => {
    const logs = await Laundry.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
});

// @desc    Add laundry log
// @route   POST /api/laundry/track
// @access  Private (Warden/Staff)
export const addLaundryLog = asyncHandler(async (req: any, res: Response) => {
    const { studentId, itemCount, notes } = req.body;

    const laundry = await Laundry.create({
        student: studentId,
        itemCount,
        notes,
        status: 'picked-up'
    });

    await createNotification(
        studentId,
        'Laundry Picked Up',
        `Your laundry (${itemCount} items) has been picked up. Tracking ID: ${laundry._id.toString().slice(-6)}`,
        'info'
    );

    res.status(201).json(laundry);
});

// @desc    Update laundry status
// @route   PUT /api/laundry/track/:id
// @access  Private (Warden/Staff)
export const updateLaundryStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, deliveryDate } = req.body;
    const laundry = await Laundry.findById(req.params.id);

    if (laundry) {
        laundry.status = status;
        if (deliveryDate) laundry.deliveryDate = deliveryDate;
        
        await laundry.save();

        await createNotification(
            laundry.student.toString(),
            `Laundry Status: ${status.replace('-', ' ')}`,
            `Your laundry status is now: ${status}.`,
            status === 'ready' ? 'success' : 'info'
        );

        res.json(laundry);
    } else {
        res.status(404);
        throw new Error('Laundry log not found');
    }
});
