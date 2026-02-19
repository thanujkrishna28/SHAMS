import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const generateShortToken = (id: string, type: string, deviceId?: string) => {
    return jwt.sign(
        {
            id,
            type,
            deviceId, // Bind to device
            jti: uuidv4() // Unique Nonce
        },
        process.env.JWT_SECRET || 'secret',
        {
            expiresIn: '40s', // Valid for 40s
        }
    );
};

export default generateToken;
