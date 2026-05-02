import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IComplaint extends Document {
    student: IUser['_id'];
    title: string;
    description: string;
    category: 'maintenance' | 'cleanliness' | 'noise' | 'security' | 'plumbing' | 'electrical' | 'other';
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'escalated' | 'resolved' | 'closed';
    image?: string;
    adminComment?: string;
    dueDate?: Date;
    resolvedAt?: Date;
    suggestedResolutionSteps?: string;
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
            enum: ['maintenance', 'cleanliness', 'noise', 'security', 'plumbing', 'electrical', 'other'],
            default: 'other',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'escalated', 'resolved', 'closed'],
            default: 'pending',
        },
        image: { type: String },
        adminComment: { type: String },
        dueDate: { type: Date },
        resolvedAt: { type: Date },
        suggestedResolutionSteps: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema, 'complaints');
