import mongoose, { Document, Schema } from 'mongoose';

export interface ILostFoundItem extends Document {
    title: string;
    description: string;
    type: 'Lost' | 'Found';
    category: string; // e.g. Electronics, Keys, Wallets
    location: string;
    date: Date;
    status: 'Active' | 'Resolved';
    reportedBy: mongoose.Types.ObjectId;
    image?: string;
    contactInfo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LostFoundItemSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, enum: ['Lost', 'Found'], required: true },
        category: { type: String, required: true },
        location: { type: String, required: true },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
        reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        image: { type: String },
        contactInfo: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<ILostFoundItem>('LostFoundItem', LostFoundItemSchema);
