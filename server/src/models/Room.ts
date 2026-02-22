import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
    block: mongoose.Types.ObjectId;
    hostel: mongoose.Types.ObjectId;
    floor: number;
    roomNumber: string;
    capacity: number;
    occupants: mongoose.Types.ObjectId[];
    type: 'Single' | 'Double' | 'Triple' | 'Dorm' | 'single' | 'double' | 'triple' | 'dorm';
    isAC: boolean;
    status: 'Available' | 'Full' | 'Maintenance' | 'Locked' | 'available' | 'full' | 'maintenance' | 'locked';
    lockExpiresAt?: Date;
    lockedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
    {
        roomNumber: { type: String, required: true, unique: true },
        block: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
        hostel: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
        floor: { type: Number, required: true },
        capacity: { type: Number, required: true, default: 2 },
        occupants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        type: {
            type: String,
            enum: ['Single', 'Double', 'Triple', 'Dorm', 'single', 'double', 'triple', 'dorm'],
            default: 'Double',
        },
        isAC: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['Available', 'Full', 'Maintenance', 'Locked', 'available', 'full', 'maintenance', 'locked'],
            default: 'Available',
        },
        lockExpiresAt: { type: Date },
        lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for occupancy percentage
RoomSchema.virtual('occupancyPercentage').get(function (this: IRoom) {
    if (!this.occupants || this.capacity === 0) return 0;
    return (this.occupants.length / this.capacity) * 100;
});

export default mongoose.model<IRoom>('Room', RoomSchema, 'rooms');
