import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Allocation from './src/models/Allocation';

dotenv.config();

const checkAllocations = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
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
