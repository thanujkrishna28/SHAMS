import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'student' | 'guardian' | 'security';
    profile?: {
        studentId?: string;
        gender?: 'Male' | 'Female';
        branch?: string;
        room?: mongoose.Types.ObjectId; 
        roomNumber?: string; 
        block?: string;
        hostel?: mongoose.Types.ObjectId;
        course?: string;
        year?: number;
        guardianName?: string;
        relation?: string;
        guardianContact?: string;
        guardianContact2?: string;
        address?: string;
        phone?: string;
        age?: number;
        applicationNum?: string;
        aadharNum?: string;
        idProof?: string;
        admissionLetter?: string;
        isVerified?: boolean;
        activeComplaints?: number;
        attendancePercentage?: number;
        qrSecret?: string;
        deviceId?: string;
        isInside?: boolean;
        lastMovementAt?: Date;
        mealPreference?: 'Veg' | 'Non-Veg';
        profileImage?: string;
        lastProfileUpdate?: Date;
        specialDiet?: string;
        allergies?: string[];
        resetPasswordOTP?: string;
        resetPasswordExpires?: Date;
        mfaSecret?: string;
        isMFAEnabled?: boolean;
        webauthnCredentials?: Array<{
            credentialID: string;
            publicKey: string;
            counter: number;
            deviceType: string;
            transports?: string[];
            telegramChatId?: string;
        }>;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        googleId: { type: String, unique: true, sparse: true },
        role: {
            type: String,
            enum: ['student', 'guardian', 'security'],
            default: 'student',
        },
        profile: {
            studentId: { type: String, unique: true, sparse: true },
            gender: { type: String, enum: ['Male', 'Female'] },
            branch: { type: String },
            room: { type: Schema.Types.ObjectId, ref: 'Room' },
            roomNumber: String,
            block: String,
            hostel: { type: Schema.Types.ObjectId, ref: 'Hostel' },
            course: String,
            year: Number,
            guardianName: String,
            relation: String,
            guardianContact: String,
            guardianContact2: String,
            address: String,
            phone: String,
            age: Number,
            applicationNum: String,
            aadharNum: String,
            idProof: String,
            admissionLetter: String,
            isVerified: { type: Boolean, default: false },
            activeComplaints: { type: Number, default: 0 },
            attendancePercentage: { type: Number, default: 0 },
            qrSecret: { type: String, select: false }, // Store secret but don't return by default
            deviceId: { type: String }, // For Device Binding
            isInside: { type: Boolean, default: true }, // State Machine: true=In, false=Out
            lastMovementAt: { type: Date },
            mealPreference: { type: String, enum: ['Veg', 'Non-Veg'] },
            profileImage: { type: String },
            lastProfileUpdate: { type: Date },
            specialDiet: { type: String }, // e.g. 'Gluten-Free', 'Vegan'
            allergies: { type: [String] }, // e.g. ['Peanuts', 'Dairy']
            resetPasswordOTP: { type: String },
            resetPasswordExpires: { type: Date },
            mfaSecret: { type: String, select: false },
            isMFAEnabled: { type: Boolean, default: false },
            webauthnCredentials: [{
                credentialID: String,
                publicKey: String,
                counter: Number,
                deviceType: String,
                transports: [String]
            }],
            telegramChatId: { type: String },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

export default mongoose.model<IUser>('User', UserSchema, 'users');
