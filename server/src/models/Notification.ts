import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'alert'],
            default: 'info'
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema, 'notifications');
