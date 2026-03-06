import mongoose, { Document, Schema } from 'mongoose';

export interface ILaundryBooking extends Document {
    student: mongoose.Types.ObjectId;
    machine: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    status: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const LaundryBookingSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        machine: { type: Schema.Types.ObjectId, ref: 'LaundryMachine', required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        duration: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
            default: 'Scheduled'
        }
    },
    { timestamps: true }
);

export default mongoose.model<ILaundryBooking>('LaundryBooking', LaundryBookingSchema);
