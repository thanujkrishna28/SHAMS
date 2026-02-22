import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Admin from '../models/Admin';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

            // Check in Users collection
            let user: any = await User.findById(decoded.id).select('-password');

            // If not found, check in Admins collection
            if (!user) {
                user = await Admin.findById(decoded.id).select('-password');
            }

            (req as any).user = user;

            if (!(req as any).user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            res.status(403).json({
                message: `User role ${(req as any).user.role} is not authorized to access this route`
            });
            return;
        }
        next();
    };
};
// Backward compatibility / shortcut aliases
export const admin = authorize('admin');
export const security = authorize('security');
