import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import * as db from '../db';
import { sdk } from '../_core/sdk';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';

const router = Router();

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram authentication data
 * https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...authData } = data;
  
  // Create data-check-string
  const checkString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key as keyof typeof authData]}`)
    .join('\n');
  
  // Create secret key from bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Create hash
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  
  return hmac === hash;
}

/**
 * Handle Telegram Login Widget authentication
 */
router.post('/auth', async (req: Request, res: Response) => {
  try {
    const authData = req.body as TelegramAuthData;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      res.status(500).json({ error: 'Telegram bot not configured' });
      return;
    }
    
    // Verify authentication data
    if (!verifyTelegramAuth(authData, botToken)) {
      res.status(401).json({ error: 'Invalid Telegram authentication' });
      return;
    }
    
    // Check auth date (should be recent, within 1 day)
    const authDate = new Date(authData.auth_date * 1000);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now.getTime() - authDate.getTime() > dayInMs) {
      res.status(401).json({ error: 'Authentication data expired' });
      return;
    }
    
    // Create or update user
    const openId = `telegram:${authData.id}`;
    const name = `${authData.first_name}${authData.last_name ? ' ' + authData.last_name : ''}`;
    
    await db.upsertUser({
      openId,
      name,
      email: null,
      loginMethod: 'telegram',
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
        loginMethod: 'telegram',
      },
    });
  } catch (error) {
    console.error('[Telegram Auth] Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
