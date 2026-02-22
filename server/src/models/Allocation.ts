import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IRoom } from './Room';

export interface IAllocation extends Document {
    student: IUser['_id'];
    hostel: mongoose.Types.ObjectId;
    block: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    requestType: 'initial' | 'change' | 'swap';
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AllocationSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        hostel: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        block: { type: Schema.Types.ObjectId, ref: 'Block', required: true },
        room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
        requestType: {
            type: String,
            enum: ['initial', 'change', 'swap'],
            default: 'initial',
        },
        reason: { type: String },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminComment: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IAllocation>('Allocation', AllocationSchema, 'allocationRequests');
