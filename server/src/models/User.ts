import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'guardian' | 'security';
    profile?: {
        // specific to student
        studentId?: string;
        gender?: 'Male' | 'Female';
        branch?: string;
        room?: mongoose.Types.ObjectId; // Reference to Room model
        roomNumber?: string; // Keep for quick access/display if populated
        block?: string;
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
        specialDiet?: string;
        allergies?: string[];
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
        password: { type: String, required: true },
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
            specialDiet: { type: String }, // e.g. 'Gluten-Free', 'Vegan'
            allergies: { type: [String] } // e.g. ['Peanuts', 'Dairy']
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
