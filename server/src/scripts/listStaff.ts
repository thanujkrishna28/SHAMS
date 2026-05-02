import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        const admins = await mongoose.connection.db!.collection('admins').find({}).toArray();
        const wardens = await mongoose.connection.db!.collection('wardens').find({}).toArray();
        
        console.log('--- ADMINS & CHIEF WARDENS ---');
        admins.forEach(a => console.log(`Name: ${a.name}, Email: ${a.email}, Role: ${a.role}`));
        
        console.log('\n--- WARDENS ---');
        wardens.forEach(w => console.log(`Name: ${w.name}, Email: ${w.email}, Role: ${w.role}`));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

run();
