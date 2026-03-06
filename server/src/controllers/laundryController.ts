import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import LaundryMachine from '../models/LaundryMachine';
import LaundryBooking from '../models/LaundryBooking';
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
