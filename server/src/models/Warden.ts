import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWarden extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'warden';
    profile?: {
        hostel?: mongoose.Types.ObjectId;
        block?: string;
        phone?: string;
        profileImage?: string;
        mfaSecret?: string;
        isMFAEnabled?: boolean;
        webauthnCredentials?: Array<{
            credentialID: string;
            publicKey: string;
            counter: number;
            deviceType: string;
            transports?: string[];
        }>;
        telegramChatId?: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const WardenSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        googleId: { type: String, unique: true, sparse: true },
        role: {
            type: String,
            enum: ['warden'],
            default: 'warden',
        },
        profile: {
            hostel: { type: Schema.Types.ObjectId, ref: 'Hostel' },
            block: String,
            phone: String,
            profileImage: String,
            mfaSecret: { type: String, select: false },
            isMFAEnabled: { type: Boolean, default: false },
            webauthnCredentials: [{
                credentialID: String,
                publicKey: String,
                counter: Number,
                deviceType: String,
                transports: [String]
            }],
            telegramChatId: { type: String }
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

WardenSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

WardenSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

export default mongoose.model<IWarden>('Warden', WardenSchema, 'wardens');
