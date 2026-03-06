import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentLog extends Document {
    feeId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    gatewayOrderId?: string;
    transactionId?: string;
    status: string;
    rawPayload: any;
    createdAt: Date;
}

const PaymentLogSchema: Schema = new Schema(
    {
        feeId: { type: Schema.Types.ObjectId, ref: 'Fee', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        gatewayOrderId: { type: String },
        transactionId: { type: String },
        status: { type: String, required: true },
        rawPayload: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IPaymentLog>('PaymentLog', PaymentLogSchema);
