import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    admin: mongoose.Types.ObjectId;
    action: string;
    targetId: mongoose.Types.ObjectId;
    targetModel: 'User' | 'Room' | 'Allocation' | 'Complaint' | 'Leave';
    details?: string;
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
    {
        admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        targetModel: {
            type: String,
            required: true,
            enum: ['User', 'Room', 'Allocation', 'Complaint', 'Leave', 'Visitor', 'Announcement']
        },
        details: { type: String },
        ipAddress: { type: String }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
