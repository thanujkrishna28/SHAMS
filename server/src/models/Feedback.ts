import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    student: mongoose.Types.ObjectId;
    category: 'mess' | 'cleaning' | 'security' | 'other';
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: {
            type: String,
            enum: ['mess', 'cleaning', 'security', 'other'],
            required: true
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema, 'feedbacks');
