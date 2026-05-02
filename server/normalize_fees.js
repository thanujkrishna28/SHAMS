const mongoose = require('mongoose');
require('dotenv').config();
const Fee = require('./dist/models/Fee').default;

async function normalizeFees() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Find all fees that are marked as 'Other' or have generic descriptions
        const fees = await Fee.find({ 
            $or: [
                { type: 'Other' },
                { type: 'Admission Fee' },
                { description: /Other Fee/i }
            ]
        });

        console.log(`Normalizing ${fees.length} fees...`);

        for (const fee of fees) {
            let newType = 'Mess'; // Default to Mess for large amounts
            let newDesc = 'Monthly Hostel & Mess Charges';

            if (fee.totalAmount === 1000 || fee.totalAmount === 5000) {
                newType = 'Admission';
                newDesc = 'One-time Admission & Registration Fee';
            } else if (fee.totalAmount === 2000) {
                newType = 'Caution Deposit';
                newDesc = 'Refundable Security Deposit';
            } else if (fee.totalAmount === 500) {
                newType = 'Laundry';
                newDesc = 'Monthly Laundry & Maintenance';
            }

            fee.type = newType;
            fee.description = newDesc;
            await fee.save();
            console.log(`- Updated Fee ${fee._id} to ${newType}`);
        }

        console.log('✅ All fees normalized successfully.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

normalizeFees();
