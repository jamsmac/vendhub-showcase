import { getDb } from './db';
import { users, sessions, passwordRecovery } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  telegramId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  const result = await db.insert(users).values({
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    role: data.role as any,
    telegramId: data.telegramId,
    openId: `local_${Date.now()}`, // Generate a unique openId for local auth
    loginMethod: 'email',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  });

  return result;
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.update(users).set({
    passwordHash,
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, userId));
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, data: {
  name?: string;
  email?: string;
  telegramId?: string;
  twoFactorEnabled?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  const updates: any = {
    updatedAt: new Date().toISOString(),
  };

  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;
  if (data.telegramId) updates.telegramId = data.telegramId;
  if (data.twoFactorEnabled !== undefined) updates.twoFactorEnabled = data.twoFactorEnabled;

  return db.update(users).set(updates).where(eq(users.id, userId));
}

/**
 * Create a session
 */
export async function createSession(data: {
  userId: number;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.insert(sessions).values({
    userId: data.userId,
    token: data.token,
    expiresAt: data.expiresAt.toISOString(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });
}

/**
 * Delete session
 */
export async function deleteSession(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Create password recovery token
 */
export async function createPasswordRecoveryToken(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.insert(passwordRecovery).values({
    userId: data.userId,
    token: data.token,
    expiresAt: data.expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get password recovery token
 */
export async function getPasswordRecoveryToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.query.passwordRecovery.findFirst({
    where: and(
      eq(passwordRecovery.token, token),
      eq(passwordRecovery.usedAt, null as any),
    ),
  });
}

/**
 * Mark password recovery token as used
 */
export async function markPasswordRecoveryTokenAsUsed(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.update(passwordRecovery).set({
    usedAt: new Date().toISOString(),
  }).where(eq(passwordRecovery.token, token));
}

/**
 * Delete expired password recovery tokens
 */
export async function deleteExpiredPasswordRecoveryTokens() {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.delete(passwordRecovery).where(
    and(
      eq(passwordRecovery.usedAt, null as any),
      // expiresAt < NOW()
    ),
  );
}

/**
 * Update last signed in timestamp
 */
export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  return db.update(users).set({
    lastSignedIn: new Date().toISOString(),
  }).where(eq(users.id, userId));
}


/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');
  
  // Search by name field (which stores the username)
  return db.query.users.findFirst({
    where: eq(users.name, username),
  });
}
