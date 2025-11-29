import { Router } from 'express';
import type { Request, Response } from 'express';
import { sdk } from '../_core/sdk';

const router = Router();

/**
 * Initiate Google OAuth flow
 * Redirects to Manus OAuth portal with Google provider
 */
router.get('/google', async (req: Request, res: Response) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback`;
    const state = Buffer.from(redirectUri).toString('base64');
    
    // Manus OAuth portal URL with Google provider
    const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL || 'https://oauth.manus.im';
    const appId = process.env.VITE_APP_ID;
    
    if (!appId) {
      res.status(500).json({ error: 'OAuth not configured' });
      return;
    }

    const authUrl = `${oauthPortalUrl}/authorize?` + new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state: state,
      provider: 'google',
      response_type: 'code',
    }).toString();

    res.redirect(authUrl);
  } catch (error) {
    console.error('[OAuth] Google auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Google OAuth' });
  }
});

/**
 * Initiate Telegram OAuth flow
 * Redirects to Manus OAuth portal with Telegram provider
 */
router.get('/telegram', async (req: Request, res: Response) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback`;
    const state = Buffer.from(redirectUri).toString('base64');
    
    const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL || 'https://oauth.manus.im';
    const appId = process.env.VITE_APP_ID;
    
    if (!appId) {
      res.status(500).json({ error: 'OAuth not configured' });
      return;
    }

    const authUrl = `${oauthPortalUrl}/authorize?` + new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state: state,
      provider: 'telegram',
      response_type: 'code',
    }).toString();

    res.redirect(authUrl);
  } catch (error) {
    console.error('[OAuth] Telegram auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Telegram OAuth' });
  }
});

/**
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await sdk.authenticateRequest(req);

    res.json({
      openId: user.openId,
      name: user.name,
      email: user.email,
      role: user.role,
      loginMethod: user.loginMethod,
    });
  } catch (error) {
    console.error('[OAuth] Get user error:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
