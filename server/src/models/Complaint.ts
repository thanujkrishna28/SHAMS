import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IComplaint extends Document {
    student: IUser['_id'];
    title: string;
    description: string;
    category: 'maintenance' | 'cleanliness' | 'noise' | 'security' | 'other';
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    image?: string;
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['maintenance', 'cleanliness', 'noise', 'security', 'other'],
            default: 'other',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved', 'rejected'],
            default: 'pending',
        },
        image: { type: String },
        adminComment: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema, 'complaints');
