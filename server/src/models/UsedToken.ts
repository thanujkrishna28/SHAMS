import mongoose, { Document, Schema } from 'mongoose';

export interface IUsedToken extends Document {
    jti: string;
    expiresAt: Date;
}

const UsedTokenSchema: Schema = new Schema({
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-delete after expiry
});

export default mongoose.model<IUsedToken>('UsedToken', UsedTokenSchema);
