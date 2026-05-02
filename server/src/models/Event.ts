import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    location: string;
    category: 'cultural' | 'sports' | 'academic' | 'other';
    organizer: mongoose.Types.ObjectId;
    attendees: mongoose.Types.ObjectId[];
    image?: string;
    createdAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        location: { type: String, required: true },
        category: { 
            type: String, 
            enum: ['cultural', 'sports', 'academic', 'other'],
            default: 'other'
        },
        organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        image: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
