import mongoose, { Document, Schema } from 'mongoose';

export interface ILaundry extends Document {
    student: mongoose.Types.ObjectId;
    itemCount: number;
    status: 'picked-up' | 'in-progress' | 'ready' | 'delivered';
    pickupDate: Date;
    deliveryDate?: Date;
    notes?: string;
}

const LaundrySchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        itemCount: { type: Number, required: true },
        status: { 
            type: String, 
            enum: ['picked-up', 'in-progress', 'ready', 'delivered'],
            default: 'picked-up'
        },
        pickupDate: { type: Date, default: Date.now },
        deliveryDate: { type: Date },
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ILaundry>('Laundry', LaundrySchema);
