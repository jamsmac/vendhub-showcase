import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRATION = '30d'; // 30 days

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT token service for generating and validating tokens
 */
export class TokenService {
  private static readonly secret = new TextEncoder().encode(JWT_SECRET);

  /**
   * Generate access and refresh tokens
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns Token pair with access and refresh tokens
   */
  static async generateTokens(userId: number, email: string, role: string): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(userId, email, role);
    const refreshToken = this.generateRefreshToken();

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  /**
   * Generate access token (JWT)
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns JWT access token
   */
  static async generateAccessToken(userId: number, email: string, role: string): Promise<string> {
    const token = await new SignJWT({
      userId,
      email,
      role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(this.secret);

    return token;
  }

  /**
   * Generate refresh token (random string)
   * @returns Refresh token
   */
  static generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Verify and decode access token
   * @param token - JWT token to verify
   * @returns Decoded token payload
   */
  static async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const verified = await jwtVerify(token, this.secret);
      return verified.payload as TokenPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Generate password reset token
   * @returns Password reset token
   */
  static generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   * @returns Email verification token
   */
  static generateEmailVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Check if token is expired
   * @param expiresAt - Token expiration timestamp
   * @returns True if token is expired
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Get token expiration date
   * @param expiresInSeconds - Expiration time in seconds
   * @returns Expiration date
   */
  static getExpirationDate(expiresInSeconds: number): Date {
    return new Date(Date.now() + expiresInSeconds * 1000);
  }
}
