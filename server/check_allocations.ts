import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Allocation from './src/models/Allocation';

dotenv.config();

const checkAllocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms');
        const allocations = await Allocation.find({}).populate('student');
        console.log('Total Allocations:', allocations.length);
        allocations.forEach(a => {
            console.log(`ID: ${a._id}, Status: ${a.status}, Student: ${a.student ? (a.student as any).name : 'MISSING'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAllocations();
