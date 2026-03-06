
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://thanujkrishna22_db_user:v4Ryc4kauuwqXEsC@cluster0.wrfbv9m.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) return;

        console.log('\n--- Documents in "admin" (singular) ---');
        const adminSingular = await db.collection('admin').find({}).toArray();
        adminSingular.forEach(a => console.log(JSON.stringify(a, null, 2)));

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

run();
