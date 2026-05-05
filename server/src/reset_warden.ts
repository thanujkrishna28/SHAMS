import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Warden from './models/Warden';

dotenv.config({ path: path.join(__dirname, '../.env') });

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        const warden = await Warden.findOne({ email: 'thanujkrishna28@gmail.com' });
        if (warden) {
            warden.password = 'warden123';
            await warden.save();
            console.log('Successfully reset Warden (thanujkrishna28@gmail.com) password to warden123');
        } else {
            console.log('Warden not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

reset();
