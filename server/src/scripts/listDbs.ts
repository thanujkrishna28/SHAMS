
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

        const admin = mongoose.connection.db?.admin();
        if (!admin) throw new Error('Could not get admin db');

        const dbs = await admin.listDatabases();
        console.log('Available databases:', dbs.databases.map(db => db.name));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
