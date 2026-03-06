
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: 'c:/Users/Hanuman/Documents/projects/New folder (6)/server/.env' });

const MONGO_URI = 'mongodb+srv://thanujkrishna22_db_user:v4Ryc4kauuwqXEsC@cluster0.wrfbv9m.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed');
        }

        const adminCol1 = db.collection('admin');
        const adminCol2 = db.collection('admins');
        const usersCol = db.collection('users');

        const admins1 = await adminCol1.find({}).toArray();
        const admins2 = await adminCol2.find({}).toArray();
        const allUsers = await usersCol.find({}).toArray();

        console.log(`Documents in 'admin' (singular): ${admins1.length}`);
        admins1.forEach(a => console.log(`- Email: ${a.email}, Name: ${a.name}`));

        console.log(`Documents in 'admins' (plural): ${admins2.length}`);
        admins2.forEach(a => console.log(`- Email: ${a.email}, Name: ${a.name}`));

        console.log(`Total documents in 'users' collection: ${allUsers.length}`);
        allUsers.forEach(u => console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`));

        const allAdmins = [...admins1, ...admins2];
        const adminEmails = allAdmins.map(a => a.email?.toLowerCase()).filter(Boolean);

        const intersection = allUsers.filter(u => u.email && u.role === 'student' && adminEmails.includes(u.email.toLowerCase()));

        if (intersection.length === 0) {
            console.log('No users found who are both students and admins.');
        } else {
            console.log('\nUsers found in both collections (Student and Admin):');
            intersection.forEach(u => {
                const adminMatch = allAdmins.find(a => a.email?.toLowerCase() === u.email.toLowerCase());
                console.log(`- Email: ${u.email}`);
                console.log(`  Student Name: ${u.name}`);
                console.log(`  Admin Name: ${adminMatch?.name}`);
                console.log(`  Student ID: ${u.profile?.studentId || 'N/A'}`);
                console.log('---');
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
