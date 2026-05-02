const mongoose = require('mongoose');
require('dotenv').config();
const Fee = require('./dist/models/Fee').default;

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- STARTING MAPPING ---');
        
        const r1 = await Fee.updateMany({ type: 'hostel' }, { $set: { type: 'Mess', description: 'Monthly Hostel & Mess Charges' } });
        console.log('Updated hostel:', r1.modifiedCount);
        
        const r2 = await Fee.updateMany({ type: 'tuition' }, { $set: { type: 'Admission', description: 'Academic Admission Fee' } });
        console.log('Updated tuition:', r2.modifiedCount);

        const r3 = await Fee.updateMany({ type: { $in: ['Other', 'other', 'Admission Fee'] } }, { $set: { type: 'Admission' } });
        console.log('Updated other/admission fee:', r3.modifiedCount);

        console.log('✅ Mapping complete.');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

run();
