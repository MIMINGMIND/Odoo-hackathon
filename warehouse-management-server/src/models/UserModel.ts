// models/User.ts
import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from '../types/authtypes';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    allowedWarehouses: Types.ObjectId[];
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
            default: 'WAREHOUSE_STAFF',
            required: true,
        },
        allowedWarehouses: [{ type: Schema.Types.ObjectId, ref: 'Warehouse' }],
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model<IUser>('User', UserSchema);
