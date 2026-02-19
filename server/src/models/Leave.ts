import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ILeave extends Document {
    student: IUser['_id'];
    startDate: Date;
    endDate: Date;
    reason: string;
    type: 'sick' | 'personal' | 'academic' | 'emergency';
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        type: {
            type: String,
            enum: ['sick', 'personal', 'academic', 'emergency'],
            default: 'personal',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminComment: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ILeave>('Leave', LeaveSchema, 'leaves');
