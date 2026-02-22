import mongoose, { Document, Schema } from 'mongoose';

export interface IBlock extends Document {
    name: string;
    hostel: mongoose.Types.ObjectId;
    floors: number;
    createdAt: Date;
    updatedAt: Date;
}

const BlockSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        hostel: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        floors: { type: Number, required: true, default: 1 },
    },
    { timestamps: true }
);

// Prevent duplicate block names in the same hostel
BlockSchema.index({ name: 1, hostel: 1 }, { unique: true });

export default mongoose.model<IBlock>('Block', BlockSchema);
