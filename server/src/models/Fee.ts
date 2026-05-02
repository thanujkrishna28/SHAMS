import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
    student: mongoose.Types.ObjectId;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    type: 'Admission' | 'Mess' | 'Caution Deposit' | 'Laundry' | 'Other';
    description?: string;
    academicYear: string;
    status: 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED';
    dueDate: Date;
    lateFee: number;
    paymentMode?: 'ONLINE' | 'OFFLINE';
    receiptNumber?: string; // For offline payments
    lastPaymentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FeeSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { 
            type: String, 
            enum: ['Admission', 'Mess', 'Caution Deposit', 'Laundry', 'Other'],
            default: 'Other'
        },
        description: { type: String },
        academicYear: { type: String, default: () => new Date().getFullYear().toString() },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        balanceAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'PARTIAL', 'PAID', 'FAILED'],
            default: 'PENDING',
        },
        dueDate: { type: Date },
        lateFee: { type: Number, default: 0 },
        paymentMode: {
            type: String,
            enum: ['ONLINE', 'OFFLINE'],
        },
        receiptNumber: { type: String },
        lastPaymentAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IFee>('Fee', FeeSchema, 'fees');
