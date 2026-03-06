import mongoose, { Document, Schema } from 'mongoose';

export interface IParcel extends Document {
    student: mongoose.Types.ObjectId;
    courierName: string;
    trackingId?: string;
    pickupCode: string; // 4-6 digit OTP
    status: 'Arrived' | 'Delivered' | 'Returned';
    receivedBy: mongoose.Types.ObjectId; // Security Guard ID
    arrivedAt: Date;
    deliveredAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ParcelSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        courierName: { type: String, required: true },
        trackingId: { type: String },
        pickupCode: { type: String, required: true },
        status: {
            type: String,
            enum: ['Arrived', 'Delivered', 'Returned'],
            default: 'Arrived',
        },
        receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        arrivedAt: { type: Date, default: Date.now },
        deliveredAt: { type: Date },
        notes: { type: String },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IParcel>('Parcel', ParcelSchema, 'parcels');
