import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import path from 'path';

// Load env vars from the root of the server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const createAdmin = async () => {
    const adminEmail = process.argv[2];
    const adminPassword = process.argv[3];
    const adminName = process.argv[4] || 'System Administrator';

    if (!adminEmail || !adminPassword) {
        console.log('\x1b[31m%s\x1b[0m', 'Error: Please provide email and password.');
        console.log('Usage: npm run create-admin <email> <password> "<name>"');
        process.exit(1);
    }

    try {
        console.log('\x1b[36m%s\x1b[0m', 'Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-hms');

        const adminExists = await Admin.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('\x1b[33m%s\x1b[0m', `Warning: Admin with email ${adminEmail} already exists.`);
            process.exit(0);
        }

        const admin = await Admin.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');
        console.log('\x1b[32m%s\x1b[0m', '  SUCCESS: Professional Admin Credential Created  ');
        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');
        console.log(`  Name:     ${admin.name}`);
        console.log(`  Email:    ${admin.email}`);
        console.log(`  Role:     Administrator`);
        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');

        process.exit(0);
    } catch (error: any) {
        console.error('\x1b[31m%s\x1b[0m', 'Error creating admin:');
        console.error(error.message);
        process.exit(1);
    }
};

createAdmin();
