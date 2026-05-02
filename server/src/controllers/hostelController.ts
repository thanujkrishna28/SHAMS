import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Hostel from '../models/Hostel';
import Block from '../models/Block';
import Room from '../models/Room';
import Warden from '../models/Warden';
import sendEmail from '../utils/sendEmail';
import { getHostelCreationEmail } from '../utils/emailTemplates';

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private (Admin/Student)
export const getHostels = asyncHandler(async (req: any, res: Response) => {
    const hostels = await Hostel.find({});

    // Enrich with block and room counts
    const enrichedHostels = await Promise.all(hostels.map(async (hostel) => {
        const blockCount = await Block.countDocuments({ hostel: hostel._id });
        const rooms = await Room.find({ hostel: hostel._id });
        const roomCount = rooms.length;
        const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
        const currentOccupants = rooms.reduce((acc, room) => acc + (room.occupants?.length || 0), 0);

        return {
            ...hostel.toObject(),
            blockCount,
            roomCount,
            totalCapacity,
            currentOccupants,
            occupancyRate: totalCapacity > 0 ? Math.round((currentOccupants / totalCapacity) * 100) : 0
        };
    }));

    res.json(enrichedHostels);
});

// @desc    Create a new hostel
// @route   POST /api/hostels
// @access  Private (Admin)
export const createHostel = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, description, chiefWardenName, chiefWardenEmail, contactNumber } = req.body;

    const hostelExists = await Hostel.findOne({ name });
    if (hostelExists) {
        res.status(400);
        throw new Error('Hostel already exists with this name');
    }

    const hostel = await Hostel.create({
        name,
        type,
        description,
        chiefWardenName,
        chiefWardenEmail,
        contactNumber,
        isActive: true
    });

    // Handle Chief Warden Account Creation and Notification
    if (chiefWardenEmail) {
        // Check if Warden account already exists
        let warden = await Warden.findOne({ email: chiefWardenEmail.toLowerCase() });
        
        const defaultPassword = 'warden' + Math.floor(1000 + Math.random() * 9000); // Generate a simple temporary password

        if (!warden) {
            // Create new Warden account
            warden = await Warden.create({
                name: chiefWardenName || 'Chief Warden',
                email: chiefWardenEmail.toLowerCase(),
                password: defaultPassword, // This will be hashed by the model pre-save hook
                role: 'warden',
                profile: {
                    hostel: hostel._id,
                    phone: contactNumber
                }
            });
            console.log(`✅ Created new Warden account for ${chiefWardenEmail} with temporary password: ${defaultPassword}`);
        } else {
            // Link existing warden to this new hostel if not already linked
            if (!warden.profile?.hostel) {
                warden.profile = {
                    ...warden.profile,
                    hostel: hostel._id
                };
                await warden.save();
            }
        }

        try {
            // Send Email with credentials if it's a new account
            await sendEmail({
                email: chiefWardenEmail,
                subject: 'Smart HMS - New Hostel Management Assignment',
                message: `You have been assigned as Chief Warden for ${name}.`,
                html: getHostelCreationEmail(
                    chiefWardenName || 'Chief Warden', 
                    name, 
                    type,
                    { 
                        email: chiefWardenEmail, 
                        password: warden?.createdAt.getTime() === warden?.updatedAt.getTime() ? defaultPassword : undefined
                    }
                )
            });
        } catch (error) {
            console.error('Email sending failed for new hostel:', error);
        }
    }

    res.status(201).json(hostel);
});

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (Admin)
export const updateHostel = asyncHandler(async (req: Request, res: Response) => {
    const hostel = await Hostel.findById(req.params.id);

    if (hostel) {
        hostel.name = req.body.name || hostel.name;
        hostel.type = req.body.type || hostel.type;
        hostel.description = req.body.description || hostel.description;
        hostel.chiefWardenName = req.body.chiefWardenName || hostel.chiefWardenName;
        hostel.chiefWardenEmail = req.body.chiefWardenEmail || hostel.chiefWardenEmail;
        hostel.contactNumber = req.body.contactNumber || hostel.contactNumber;
        hostel.isActive = req.body.isActive !== undefined ? req.body.isActive : hostel.isActive;

        const updatedHostel = await hostel.save();
        res.json(updatedHostel);
    } else {
        res.status(404);
        throw new Error('Hostel not found');
    }
});

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (Admin)
export const deleteHostel = asyncHandler(async (req: Request, res: Response) => {
    const hostel = await Hostel.findById(req.params.id);

    if (hostel) {
        // Prevent deletion if blocks exist
        const blockExists = await Block.findOne({ hostel: hostel._id });
        if (blockExists) {
            res.status(400);
            throw new Error('Cannot delete hostel because blocks are associated with it');
        }

        await hostel.deleteOne();
        res.json({ message: 'Hostel removed' });
    } else {
        res.status(404);
        throw new Error('Hostel not found');
    }
});
