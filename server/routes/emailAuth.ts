import { Router } from 'express';
import type { Request, Response } from 'express';
import * as db from '../db';
import { sdk } from '../_core/sdk';
import { PasswordService } from '../services/passwordService';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';

const router = Router();

/**
 * Register new user with email and password
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Validate email format
    if (!PasswordService.validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(password);

    // Create user
    const openId = `email:${email}`;
    await db.upsertUser({
      openId,
      name,
      email,
      loginMethod: 'email',
      passwordHash,
      lastSignedIn: new Date().toISOString(),
    });

    // Create session token
    const sessionToken = await sdk.createSessionToken(openId, {
      name,
      expiresInMs: ONE_YEAR_MS,
    });

    // Set cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    res.json({
      success: true,
      user: {
        openId,
        name,
        email,
        loginMethod: 'email',
      },
    });
  } catch (error) {
    console.error('[Email Auth] Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Get user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if user has password (might be OAuth-only user)
    if (!user.passwordHash) {
      res.status(401).json({ 
        error: 'This account uses social login. Please sign in with Google or Telegram.' 
      });
      return;
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date().toISOString(),
    });

    // Create session token
    const sessionToken = await sdk.createSessionToken(user.openId, {
      name: user.name || email,
      expiresInMs: ONE_YEAR_MS,
    });

    // Set cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    res.json({
      success: true,
      user: {
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Email Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Logout - clear session cookie
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Email Auth] Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
