import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
    block: string;
    floor: number;
    roomNumber: string;
    capacity: number;
    occupants: mongoose.Types.ObjectId[];
    type: 'single' | 'double' | 'triple' | 'dorm';
    isAC: boolean;
    status: 'available' | 'full' | 'maintenance' | 'locked';
    lockExpiresAt?: Date;
    lockedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
    {
        block: { type: String, required: true, index: true },
        floor: { type: Number, required: true },
        roomNumber: { type: String, required: true, unique: true },
        capacity: { type: Number, required: true, default: 2 },
        occupants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        type: {
            type: String,
            enum: ['single', 'double', 'triple', 'dorm'],
            default: 'double',
        },
        isAC: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['available', 'full', 'maintenance', 'locked'], // 'locked' for allocation transaction
            default: 'available',
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
