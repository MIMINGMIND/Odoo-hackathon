// models/OtpToken.ts
import { Schema, model, Document, Types } from 'mongoose';

export type OtpPurpose = 'PASSWORD_RESET' | 'LOGIN';

export interface IOtpToken extends Document {
    user: Types.ObjectId;
    code: string;       // for production, consider hashing this
    purpose: OtpPurpose;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, required: true },
        purpose: {
            type: String,
            enum: ['PASSWORD_RESET', 'LOGIN'],
            required: true,
        },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

OtpTokenSchema.index({ user: 1, purpose: 1, expiresAt: 1 });
OtpTokenSchema.index({ code: 1 });

export const OtpTokenModel = model<IOtpToken>('OtpToken', OtpTokenSchema);
