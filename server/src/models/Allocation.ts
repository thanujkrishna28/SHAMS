import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IRoom } from './Room';

export interface IAllocation extends Document {
    student: IUser['_id'];
    requestedBlock: string;
    requestedRoomType?: 'single' | 'double' | 'triple' | 'dorm';
    requestType: 'initial' | 'change' | 'swap';
    reason?: string;
    lockedRoom?: IRoom['_id'];
    assignedRoom?: IRoom['_id'];
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AllocationSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        requestedBlock: { type: String, required: true },
        requestedRoomType: {
            type: String,
            enum: ['single', 'double', 'triple', 'dorm'],
        },
        requestType: {
            type: String,
            enum: ['initial', 'change', 'swap'],
            default: 'initial',
        },
        reason: { type: String },
        lockedRoom: { type: Schema.Types.ObjectId, ref: 'Room' },
        assignedRoom: { type: Schema.Types.ObjectId, ref: 'Room' },
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
