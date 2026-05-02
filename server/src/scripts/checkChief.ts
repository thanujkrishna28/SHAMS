
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shams';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'thanujkrishna28@gmail.com' });
        console.log(JSON.stringify(user, null, 2));
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

run();
