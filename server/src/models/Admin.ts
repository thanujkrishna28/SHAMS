import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
    name: string;
    email: string;
    permissions: string[];
    createdAt: Date;
}

const AdminSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        permissions: { type: [String], default: ['all'] },
    },
    { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema, 'admin');
