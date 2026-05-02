
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Hostel from '../models/Hostel';
import Room from '../models/Room';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shams';

// Define Block schema inline to avoid import issues if needed
const BlockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    isActive: { type: Boolean, default: true }
});
const Block = mongoose.models.Block || mongoose.model('Block', BlockSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        
        // 1. Create a default hostel
        let hostel = await Hostel.findOne({ name: 'Shams Main Hostel' });
        if (!hostel) {
            hostel = await Hostel.create({
                name: 'Shams Main Hostel',
                type: 'BOYS',
                totalBlocks: 2,
                isActive: true
            });
            console.log('Created default hostel:', hostel.name);
        }

        // 2. Create a default block
        let block = await Block.findOne({ name: 'Block A', hostel: hostel._id });
        if (!block) {
            block = await Block.create({
                name: 'Block A',
                hostel: hostel._id,
                isActive: true
            });
            console.log('Created default block:', block.name);
        }

        // 3. Assign to Warden
        const wardenEmail = process.env.WARDEN_EMAIL || 'warden@university.edu';
        const warden = await User.findOne({ email: wardenEmail.toLowerCase().trim() });
        
        if (warden) {
            if (!warden.profile) warden.profile = {};
            warden.profile.hostel = hostel._id as mongoose.Types.ObjectId;
            warden.profile.block = block.name;
            warden.profile.isVerified = true;
            await warden.save();
            console.log(`Assigned hostel ${hostel.name} and block ${block.name} to Warden ${warden.email}`);
        }

        // 4. Assign to Chief Warden
        const chiefWarden = await User.findOne({ email: 'thanujkrishna28@gmail.com' });
        if (chiefWarden) {
            if (!chiefWarden.profile) chiefWarden.profile = {};
            chiefWarden.profile.hostel = hostel._id as mongoose.Types.ObjectId;
            chiefWarden.profile.block = block.name;
            chiefWarden.profile.isVerified = true;
            await chiefWarden.save();
            console.log(`Assigned hostel ${hostel.name} to Chief Warden ${chiefWarden.email}`);
        }

        // 5. Create some rooms if none exist
        const roomCount = await Room.countDocuments({ hostel: hostel._id });
        if (roomCount === 0) {
            const rooms = [
                { roomNumber: '101', floor: 1, capacity: 3, hostel: hostel._id, block: block._id, type: 'Triple', status: 'Available' },
                { roomNumber: '102', floor: 1, capacity: 3, hostel: hostel._id, block: block._id, type: 'Triple', status: 'Available' },
                { roomNumber: '201', floor: 2, capacity: 3, hostel: hostel._id, block: block._id, type: 'Triple', status: 'Available' }
            ];
            await Room.insertMany(rooms);
            console.log('Created 3 dummy rooms for testing');
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

run();
