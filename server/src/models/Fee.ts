import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IFee extends Document {
    student: IUser['_id'];
    title: string;
    description?: string;
    amount: number;
    amountPaid: number;
    dueDate: Date;
    status: 'pending' | 'partially_paid' | 'paid';
    type: 'tuition' | 'hostel' | 'mess' | 'other';
    paymentLink?: string;
    transactionHistory: Array<{
        amount: number;
        date: Date;
        transactionId: string;
        paymentMethod: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const FeeSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String },
        amount: { type: Number, required: true },
        amountPaid: { type: Number, default: 0 },
        dueDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['pending', 'partially_paid', 'paid'],
            default: 'pending',
        },
        type: {
            type: String,
            enum: ['tuition', 'hostel', 'mess', 'other'],
            default: 'other',
        },
        paymentLink: { type: String, default: 'https://payment-gateway.example.com/pay' },
        transactionHistory: [
            {
                amount: { type: Number },
                date: { type: Date, default: Date.now },
                transactionId: { type: String },
                paymentMethod: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IFee>('Fee', FeeSchema, 'fees');
