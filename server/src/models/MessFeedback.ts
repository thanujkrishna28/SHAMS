import mongoose, { Schema, Document } from 'mongoose';

export interface IMessFeedback extends Document {
    student: mongoose.Types.ObjectId;
    studentName: string;
    studentRoom?: string;
    rating: number; // 1-5 Stars
    category: 'Food Quality' | 'Hygiene' | 'Service' | 'Variety' | 'Other';
    comment: string;
    mealType?: 'Breakfast' | 'Lunch' | 'Dinner';
    isAnonymous: boolean;
    createdAt: Date;
}

const MessFeedbackSchema: Schema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: { type: String, required: true },
    studentRoom: { type: String },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        enum: ['Food Quality', 'Hygiene', 'Service', 'Variety', 'Other'],
        required: true
    },
    comment: { type: String, required: true },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner']
    },
    isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IMessFeedback>('MessFeedback', MessFeedbackSchema);
