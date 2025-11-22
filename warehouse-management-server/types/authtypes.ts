export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export interface JwtPayloadUser {
    id: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloadUser;
        }
    }
}