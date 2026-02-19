import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    type: 'normal' | 'emergency';
    targetAudience: {
        type: 'all' | 'block' | 'floor';
        value?: string; // e.g., 'A' for block, or '1' for floor
    };
    expiresAt: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['normal', 'emergency'],
            default: 'normal'
        },
        targetAudience: {
            type: {
                type: String,
                enum: ['all', 'block', 'floor'],
                default: 'all',
            },
            value: { type: String }, // specific block name or floor number
        },
        expiresAt: { type: Date, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema, 'announcements');
