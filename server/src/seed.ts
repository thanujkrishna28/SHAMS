import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import all models to ensure they are registered
import User from './models/User';
import Admin from './models/Admin';
import Room from './models/Room';
import Allocation from './models/Allocation';
import Complaint from './models/Complaint';
import Leave from './models/Leave';
import Announcement from './models/Announcement';
import Notification from './models/Notification';
import Feedback from './models/Feedback';
import MessMenu from './models/MessMenu';
import Fee from './models/Fee';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // Create dummy entries to force collection creation
        let dummyUser = await User.findOne({ email: 'seed@test.com' });
        if (!dummyUser) {
            dummyUser = new User({
                name: 'Seed User',
                email: 'seed@test.com',
                password: 'password',
                role: 'student'
            });
            await dummyUser.save();
        } else {
            dummyUser.password = 'password';
            await dummyUser.save();
        }

        let adminUser = await User.findOne({ email: 'admin@test.com' });
        if (!adminUser) {
            adminUser = new User({
                name: 'System Admin',
                email: 'admin@test.com',
                password: 'password',
                role: 'admin'
            });
            await adminUser.save();
        } else {
            adminUser.password = 'password';
            await adminUser.save();
        }

        await Admin.findOneAndUpdate(
            { email: 'admin@test.com' },
            { name: 'System Admin', permissions: ['all'] },
            { upsert: true }
        );

        await Room.findOneAndUpdate(
            { roomNumber: 'SEED-01' },
            { block: 'S', floor: 1, capacity: 1, type: 'single' },
            { upsert: true }
        );

        await Allocation.findOneAndUpdate(
            { student: dummyUser._id },
            { requestedBlock: 'S', requestType: 'initial', status: 'pending' },
            { upsert: true }
        );

        await Complaint.findOneAndUpdate(
            { student: dummyUser._id },
            { title: 'Seed Complaint', description: 'Testing', category: 'other' },
            { upsert: true }
        );

        await Leave.findOneAndUpdate(
            { student: dummyUser._id },
            { startDate: new Date(), endDate: new Date(), reason: 'Seed' },
            { upsert: true }
        );

        await Announcement.findOneAndUpdate(
            { title: 'Welcome' },
            { message: 'System Seeded', targetAudience: { type: 'all' }, expiresAt: new Date(Date.now() + 86400000), createdBy: dummyUser._id },
            { upsert: true }
        );

        await Notification.findOneAndUpdate(
            { recipient: dummyUser._id },
            { title: 'Seed', message: 'Ready' },
            { upsert: true }
        );

        await Feedback.findOneAndUpdate(
            { student: dummyUser._id },
            { category: 'other', rating: 5, comment: 'Perfect' },
            { upsert: true }
        );
        if (dummyUser) {
            await Fee.findOneAndUpdate(
                { student: dummyUser._id, title: 'Academic Fees - Semester 1' },
                {
                    amount: 50000,
                    amountPaid: 0,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    type: 'tuition',
                    description: 'Annual tuition fees for the first semester'
                },
                { upsert: true }
            );

            await Fee.findOneAndUpdate(
                { student: dummyUser._id, title: 'Hostel Maintenance' },
                {
                    amount: 5000,
                    amountPaid: 5000,
                    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    type: 'hostel',
                    status: 'paid',
                    description: 'Monthly maintenance charges for hostel facilities'
                },
                { upsert: true }
            );
        }

        // Seed Weekly Mess Menu
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const menuData = [
            {
                day: 'Monday',
                breakfast: { veg: ['Idly', 'Sambar', 'Chutney'], nonVeg: ['Egg Bonda'] },
                lunch: { veg: ['Rice', 'Dal', 'Curd', 'Veg Curry'], nonVeg: ['Chicken Curry'] },
                dinner: { veg: ['Roti', 'Paneer Butter Masala'], nonVeg: ['Egg Curry'] }
            },
            {
                day: 'Tuesday',
                breakfast: { veg: ['Dosa', 'Ginger Chutney'], nonVeg: ['Omelette'] },
                lunch: { veg: ['Jeera Rice', 'Aloo Fry', 'Rasam'], nonVeg: ['Fish Fry'] },
                dinner: { veg: ['Rice', 'Sambar', 'Leafy Veg'], nonVeg: ['Chicken Fry'] }
            },
            {
                day: 'Wednesday',
                breakfast: { veg: ['Puri', 'Potato Masala'], nonVeg: ['Boiled Egg'] },
                lunch: { veg: ['Veg Biryani', 'Raitha'], nonVeg: ['Chicken Biryani'] },
                dinner: { veg: ['Roti', 'Mixed Veg Curry'], nonVeg: ['Egg Fry'] }
            },
            {
                day: 'Thursday',
                breakfast: { veg: ['Upma', 'Chutney'], nonVeg: ['Egg Bhurji'] },
                lunch: { veg: ['Rice', 'Leafy Dal', 'Yam Fry'], nonVeg: ['Prawns Curry'] },
                dinner: { veg: ['Rice', 'Tomato Pappu', 'Vadiyalu'], nonVeg: ['Chicken Masala'] }
            },
            {
                day: 'Friday',
                breakfast: { veg: ['Pongal', 'Gotsu'], nonVeg: ['Egg Curry'] },
                lunch: { veg: ['Lemon Rice', 'Curd Rice'], nonVeg: ['Chicken Dum Biryani'] },
                dinner: { veg: ['Roti', 'Dal Tadka'], nonVeg: ['Mutton Curry'] }
            },
            {
                day: 'Saturday',
                breakfast: { veg: ['Vada', 'Sambar'], nonVeg: ['Chicken Kheema'] },
                lunch: { veg: ['Rice', 'Drumstick Curry', 'Ghee'], nonVeg: ['Egg Masala'] },
                dinner: { veg: ['Fried Rice', 'Manchurian'], nonVeg: ['Chilli Chicken'] }
            },
            {
                day: 'Sunday',
                breakfast: { veg: ['Mysore Bajji', 'Chutney'], nonVeg: ['Egg Roast'] },
                lunch: { veg: ['Pulao', 'Paneer Tikka'], nonVeg: ['Special Chicken Biryani'] },
                dinner: { veg: ['Rice', 'Rasam', 'Papad'], nonVeg: ['Egg Gravy'] }
            }
        ];

        for (const item of menuData) {
            await MessMenu.findOneAndUpdate(
                { day: item.day },
                item,
                { upsert: true }
            );
        }

        console.log('Database seeded successfully. All collections should now appear.');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
