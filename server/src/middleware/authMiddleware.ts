import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Admin from '../models/Admin';
import Warden from '../models/Warden';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

            // Check in Users collection (Students)
            let user: any = await User.findById(decoded.id).select('-password');

            // If not found, check in Admins collection (Admin/Chief Warden)
            if (!user) {
                user = await Admin.findById(decoded.id).select('-password');
            }

            // If still not found, check in Wardens collection
            if (!user) {
                user = await Warden.findById(decoded.id).select('-password');
            }

            (req as any).user = user;

            if (!(req as any).user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const ROLE_LEVELS: Record<string, number> = {
    'student': 1,
    'security': 2,
    'warden': 3,
    'chief_warden': 4,
    'admin': 5
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        const userRole = String(user?.role || '').toLowerCase().trim();
        const allowedRoles = roles.map(r => String(r).toLowerCase().trim());

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Role "${userRole}" is not authorized.`
            });
        }
        next();
    };
};

/**
 * Ensures the user has a minimum privilege level.
 * 1: student, 2: security, 3: warden, 4: chief_warden, 5: admin
 */
export const requireLevel = (minLevel: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        const userRole = String(user?.role || '').toLowerCase().trim();
        const currentLevel = ROLE_LEVELS[userRole] || 0;

        if (currentLevel < minLevel) {
            return res.status(403).json({
                message: `Insufficient privileges. Minimum level ${minLevel} required (Current: ${currentLevel}).`
            });
        }
        next();
    };
};

// Convenience aliases
export const admin = requireLevel(5);
export const chiefWarden = requireLevel(4);
export const warden = requireLevel(3);
export const security = requireLevel(2);
