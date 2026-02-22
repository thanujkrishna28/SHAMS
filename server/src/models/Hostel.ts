import mongoose, { Document, Schema } from 'mongoose';

export interface IHostel extends Document {
    name: string;
    type: 'BOYS' | 'GIRLS';
    description?: string;
    totalBlocks: number;
    wardenName?: string;
    contactNumber?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HostelSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        type: { type: String, enum: ['BOYS', 'GIRLS'], required: true },
        description: { type: String },
        totalBlocks: { type: Number, default: 0 },
        wardenName: { type: String },
        contactNumber: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IHostel>('Hostel', HostelSchema);
