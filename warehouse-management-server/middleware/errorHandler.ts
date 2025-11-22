import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details,
        });
    }

    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
};
