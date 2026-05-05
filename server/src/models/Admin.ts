import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'admin' | 'chief_warden';
    profile?: {
        hostel?: mongoose.Types.ObjectId;
        block?: string;
        phone?: string;
        profileImage?: string;
        mfaSecret?: string;
        isMFAEnabled?: boolean;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        googleId: { type: String, unique: true, sparse: true },
        role: {
            type: String,
            enum: ['admin', 'chief_warden'],
            required: true,
        },
        profile: {
            hostel: { type: Schema.Types.ObjectId, ref: 'Hostel' },
            block: String,
            phone: String,
            profileImage: String,
            mfaSecret: { type: String, select: false },
            isMFAEnabled: { type: Boolean, default: false }
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

AdminSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

export default mongoose.model<IAdmin>('Admin', AdminSchema, 'admins');
