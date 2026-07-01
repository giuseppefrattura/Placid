import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Generates a secure password hash using scrypt.
 * Format returned: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored salt:hash combination.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  
  const [salt, hash] = parts;
  const verifyHash = scryptSync(password, salt, 64).toString('hex');
  
  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(verifyHash, 'hex')
  );
}
