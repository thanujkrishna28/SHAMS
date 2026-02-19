import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
    student: mongoose.Types.ObjectId;
    visitorName: string;
    relation: string;
    visitDate: Date;
    expectedTime: string;
    status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'departed';
    approvedBy?: mongoose.Types.ObjectId; // Security or Admin
    checkInTime?: Date;
    checkOutTime?: Date;
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VisitorSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        visitorName: { type: String, required: true },
        relation: { type: String, required: true },
        visitDate: { type: Date, required: true },
        expectedTime: { type: String, required: true }, // e.g., "14:00"
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'checked-in', 'departed'],
            default: 'pending'
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        checkInTime: { type: Date },
        checkOutTime: { type: Date },
        adminComment: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
