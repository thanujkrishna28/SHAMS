import mongoose, { Schema, Document } from 'mongoose';

export interface IMessMenu extends Document {
    day: string; // Monday, Tuesday, etc.
    breakfast: {
        veg: string[];
        nonVeg: string[];
    };
    lunch: {
        veg: string[];
        nonVeg: string[];
    };
    dinner: {
        veg: string[];
        nonVeg: string[];
    };
    lastUpdated: Date;
}

const MessMenuSchema: Schema = new Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        unique: true
    },
    breakfast: {
        veg: [String],
        nonVeg: [String]
    },
    lunch: {
        veg: [String],
        nonVeg: [String]
    },
    dinner: {
        veg: [String],
        nonVeg: [String]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model<IMessMenu>('MessMenu', MessMenuSchema);
