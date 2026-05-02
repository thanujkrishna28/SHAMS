import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    warden: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId; // Kept for internal validation but never exposed
    rating: number;
    comment: string;
    isAnonymous: boolean;
    createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
    {
        warden: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        isAnonymous: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
