import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
    student: mongoose.Types.ObjectId;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    paymentMode: 'ONLINE' | 'OFFLINE';
    gatewayOrderId?: string;
    transactionId?: string;
    paidAt?: Date;
    receiptNumber?: string; // For offline payments
    createdAt: Date;
    updatedAt: Date;
}

const FeeSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED'],
            default: 'PENDING',
        },
        paymentMode: {
            type: String,
            enum: ['ONLINE', 'OFFLINE'],
        },
        gatewayOrderId: { type: String },
        transactionId: { type: String },
        paidAt: { type: Date },
        receiptNumber: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IFee>('Fee', FeeSchema);
