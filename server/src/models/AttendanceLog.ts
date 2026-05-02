import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IAttendance extends Document {
    student: IUser['_id'];
    type: 'entry' | 'exit' | 'present' | 'absent';
    location: string; // 'Main Gate', 'Block A', etc.
    room?: mongoose.Types.ObjectId;
    scannedBy?: IUser['_id']; // Warden who marked it
    timestamp: Date;
}

const AttendanceSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['entry', 'exit', 'present', 'absent'],
            required: true,
        },
        location: { type: String, required: true },
        room: { type: Schema.Types.ObjectId, ref: 'Room' },
        scannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true, // Use createdAt as the scan timestamp
    }
);

export default mongoose.model<IAttendance>('AttendanceLog', AttendanceSchema, 'attendance_logs');
