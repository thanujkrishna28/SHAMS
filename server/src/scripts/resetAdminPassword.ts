
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to database...');

        const email = 'admin@university.edu';
        const newPassword = 'admin123';

        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log('Admin not found');
            process.exit(1);
        }

        admin.password = newPassword;
        await admin.save();

        console.log('-------------------------------------------------');
        console.log(' SUCCESS: Admin Password Reset Successfully     ');
        console.log('-------------------------------------------------');
        console.log(` Email: ${email}`);
        console.log(` New Password: ${newPassword}`);
        console.log('-------------------------------------------------');

        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
