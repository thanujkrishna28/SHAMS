
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://thanujkrishna22_db_user:v4Ryc4kauuwqXEsC@cluster0.wrfbv9m.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) return;

        console.log('\n--- Documents in "users" ---');
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(JSON.stringify(u, null, 2)));

        console.log('\n--- Documents in "admins" ---');
        const admins = await db.collection('admins').find({}).toArray();
        admins.forEach(a => console.log(JSON.stringify(a, null, 2)));

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

run();
