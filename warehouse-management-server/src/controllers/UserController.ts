// controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { OtpTokenModel } from '../models/OTPToken';
import { JwtPayloadUser } from '../types/authtypes';
import { ApiError } from '../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const OTP_EXP_MINUTES = Number(process.env.OTP_EXP_MINUTES || 10);

// local async wrapper
const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
        (req: Request, res: Response, next: NextFunction) =>
            fn(req, res, next).catch(next);

function signToken(user: JwtPayloadUser) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

// POST /auth/register
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        throw ApiError.badRequest('name, email, password are required');
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
        throw ApiError.badRequest('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        name,
        email,
        passwordHash,
        role: role || 'WAREHOUSE_STAFF',
    });

    const payload: JwtPayloadUser = { id: user._id.toString(), role: user.role };
    const token = signToken(payload);

    res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
});

// POST /auth/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw ApiError.badRequest('email and password are required');
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload: JwtPayloadUser = { id: user._id.toString(), role: user.role };
    const token = signToken(payload);

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
});

// POST /auth/request-password-reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw ApiError.badRequest('email is required');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
        // always respond OK for privacy
        return res.json({ message: 'If this email exists, an OTP has been sent' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000);

    await OtpTokenModel.create({
        user: user._id,
        code,
        purpose: 'PASSWORD_RESET',
        expiresAt,
    });

    // TODO: replace with real email/SMS
    console.log(`Password reset OTP for ${user.email}: ${code}`);

    res.json({ message: 'If this email exists, an OTP has been sent' });
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        throw ApiError.badRequest('email, code, newPassword are required');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
        throw ApiError.badRequest('Invalid email or code');
    }

    const now = new Date();

    const otp = await OtpTokenModel.findOne({
        user: user._id,
        code,
        purpose: 'PASSWORD_RESET',
        used: false,
        expiresAt: { $gt: now },
    });

    if (!otp) {
        throw ApiError.badRequest('Invalid or expired OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    otp.used = true;
    await otp.save();

    res.json({ message: 'Password has been reset successfully' });
});
