import { randomBytes, scryptSync } from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, derived] = stored.split(':');
    const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return hash === derived;
}
