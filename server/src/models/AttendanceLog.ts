import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IAttendance extends Document {
    student: IUser['_id'];
    type: 'entry' | 'exit';
    location: string; // 'Main Gate', 'Mess', 'Library'
    scannedBy?: IUser['_id'];
    timestamp: Date;
}

const AttendanceSchema: Schema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['entry', 'exit'],
            required: true,
        },
        location: { type: String, required: true },
        scannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true, // Use createdAt as the scan timestamp
    }
);

export default mongoose.model<IAttendance>('AttendanceLog', AttendanceSchema);
