
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resetChiefWarden = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to database...');

        const email = 'warden@university.edu';
        const newPassword = 'warden123';

        let admin = await Admin.findOne({ email });

        if (!admin) {
            console.log('Chief Warden not found, creating one...');
            admin = await Admin.create({
                name: 'Chief Warden',
                email: email,
                password: newPassword,
                role: 'chief_warden'
            });
        } else {
            admin.password = newPassword;
            admin.role = 'chief_warden';
            await admin.save();
        }

        console.log('-------------------------------------------------');
        console.log(' SUCCESS: Chief Warden Credentials Ready         ');
        console.log('-------------------------------------------------');
        console.log(` Email: ${email}`);
        console.log(` Password: ${newPassword}`);
        console.log(` Role: chief_warden`);
        console.log('-------------------------------------------------');

        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetChiefWarden();
