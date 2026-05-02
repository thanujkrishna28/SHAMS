
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shams';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) return;

        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            console.log(`\n--- Documents in "${col.name}" ---`);
            const docs = await db.collection(col.name).find({}).limit(5).toArray();
            docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
        }

        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

run();
