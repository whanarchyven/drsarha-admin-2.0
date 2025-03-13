import { SignJWT } from 'jose';
import type { User } from '../models/User';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: SALT_ROUNDS
    });
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await Bun.password.verify(password, hashedPassword);
}

export async function generateAuthToken(user: User): Promise<string> {
    const payload = {
        id: user._id?.toString(),
        email: user.email,
        role: user.role
    };

    console.log('JWT_SECRET_KEY', JWT_SECRET_KEY)

    const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);
    
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secretKey);
} 