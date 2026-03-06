import mongoose, { Document, Schema } from 'mongoose';

export interface ILaundryMachine extends Document {
    name: string; // e.g., "Machine 01"
    type: 'Washer' | 'Dryer';
    status: 'Available' | 'Running' | 'Maintenance';
    location: string; // Block Name or Floor
    currentBooking?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LaundryMachineSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ['Washer', 'Dryer'], default: 'Washer' },
        status: {
            type: String,
            enum: ['Available', 'Running', 'Maintenance'],
            default: 'Available'
        },
        location: { type: String, required: true },
        currentBooking: { type: Schema.Types.ObjectId, ref: 'LaundryBooking' }
    },
    { timestamps: true }
);

export default mongoose.model<ILaundryMachine>('LaundryMachine', LaundryMachineSchema);
