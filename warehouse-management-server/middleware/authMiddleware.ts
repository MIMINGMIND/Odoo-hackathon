// middleware/authmiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { JwtPayloadUser, UserRole } from '../types/authtypes';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(ApiError.unauthorized('Missing Authorization header'));
    }

    const token = header.substring(7);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadUser;
        req.user = payload;
        next();
    } catch (err) {
        return next(ApiError.unauthorized('Invalid or expired token'));
    }
};

export const requireRole = (roles: UserRole | UserRole[]) => {
    const allowed = Array.isArray(roles) ? roles : [roles];

    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(ApiError.unauthorized());
        }
        if (!allowed.includes(req.user.role)) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }
        next();
    };
};
