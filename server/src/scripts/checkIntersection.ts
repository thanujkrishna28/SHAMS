
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const MONGO_URI = 'mongodb+srv://thanujkrishna22_db_user:v4Ryc4kauuwqXEsC@cluster0.wrfbv9m.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to hostel_db');

        const db = mongoose.connection.db;
        if (!db) return;

        console.log('Existing collections:', (await db.listCollections().toArray()).map(c => c.name));

        const users = await db.collection('users').find({}).toArray();
        console.log(`Documents in 'users': ${users.length}`);

        const admins = await db.collection('admins').find({}).toArray();
        console.log(`Documents in 'admins': ${admins.length}`);

        const intersection = users.filter(u => admins.some(a => a.email.toLowerCase() === u.email.toLowerCase()));

        if (intersection.length > 0) {
            console.log('Intersection found:');
            intersection.forEach(u => console.log(`- ${u.email}`));
        } else {
            console.log('No common emails found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
