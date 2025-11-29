import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Password service for hashing and verifying passwords using bcrypt
 */
export class PasswordService {
  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation result and error message if invalid
   */
  static validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return {
        valid: false,
        error: 'Password must be at least 8 characters long',
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one lowercase letter',
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one uppercase letter',
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        error: 'Password must contain at least one number',
      };
    }

    return { valid: true };
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if email is valid
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
