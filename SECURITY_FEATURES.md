# VendHub Manager - Security Features Implementation

## Overview

This document outlines the comprehensive security features implemented for the VendHub Manager authentication system. The implementation includes three major security enhancements: brute-force protection, two-factor authentication (2FA), and password recovery.

---

## 1. Brute-Force Protection

### Features
- **Failed Login Attempt Tracking**: Records all failed login attempts with IP address and user agent
- **Account Lockout**: Automatically locks accounts after 5 failed login attempts
- **Lockout Duration**: 15-minute temporary lockout period
- **Automatic Unlock**: Accounts automatically unlock after the lockout period expires
- **Successful Login Reset**: Clears failed attempt history after successful login
- **Admin Controls**: Admins can manually reset lockouts for accounts

### Implementation

**Service**: `server/services/loginAttemptService.ts`

Key Methods:
- `recordAttempt()` - Records login attempts (success/failed/locked)
- `shouldBlockLogin()` - Checks if login should be blocked
- `getFailedAttemptCount()` - Gets number of failed attempts in the last hour
- `isLocked()` - Checks if account is currently locked
- `clearFailedAttempts()` - Clears failed attempts after successful login
- `resetLockout()` - Admin function to manually reset lockout
- `getStatistics()` - Returns security statistics for dashboard

**Database Table**: `loginAttempts`
```sql
- id: INT AUTO_INCREMENT PRIMARY KEY
- userId: INT (nullable)
- email: VARCHAR(320)
- ipAddress: VARCHAR(45)
- userAgent: TEXT
- status: ENUM('success', 'failed', 'locked')
- failureReason: VARCHAR(255)
- attemptNumber: INT
- lockoutUntil: TIMESTAMP
- createdAt: TIMESTAMP
```

**Integration Points**:
- Modified `server/routers/auth.ts` login endpoint
- Added brute-force checks before password verification
- Records all login attempts (success and failure)
- Displays lockout messages to users

### Configuration
- MAX_FAILED_ATTEMPTS: 5
- LOCKOUT_DURATION_MS: 15 minutes (900,000 ms)
- ATTEMPT_WINDOW_MS: 1 hour (3,600,000 ms)

---

## 2. Two-Factor Authentication (TOTP)

### Features
- **TOTP-Based 2FA**: Time-based One-Time Password authentication
- **Authenticator App Support**: Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
- **QR Code Generation**: Easy setup with QR codes
- **Backup Codes**: 10 backup codes for account recovery
- **Role-Based**: Can be enabled for Admin/SuperAdmin roles
- **Token Verification**: 30-second time windows with clock skew tolerance

### Implementation

**Service**: `server/services/twoFactorService.ts`

Key Methods:
- `generateSecret()` - Generates TOTP secret and QR code URL
- `generateQRCode()` - Creates QR code data URL for scanning
- `verifyToken()` - Verifies TOTP token with 2-window tolerance
- `generateBackupCodes()` - Creates 10 backup codes
- `hashBackupCodes()` - Hashes codes for storage
- `verifyBackupCode()` - Verifies backup code validity
- `removeBackupCode()` - Removes used backup code
- `enableTwoFactor()` - Enables 2FA for user
- `disableTwoFactor()` - Disables 2FA for user
- `getUserTwoFactorStatus()` - Gets 2FA status
- `validateSetup()` - Validates setup before enabling

**Dependencies**:
- `speakeasy` (v2.0.0) - TOTP generation and verification
- `qrcode` (v1.5.4) - QR code generation

**Database Considerations**:
- Uses existing `users` table with `twoFactorEnabled` boolean field
- Future: Create separate tables for storing encrypted secrets and backup codes
  - `twoFactorSecrets` table
  - `twoFactorBackupCodes` table

### Configuration
- Token Window: 2 (allows 30-second tolerance on each side)
- Backup Codes: 10 codes, 8 characters each
- Issuer: "VendHub Manager"

---

## 3. Password Recovery

### Features
- **Email-Based Reset**: Secure password reset via email
- **Secure Tokens**: Cryptographically secure random tokens
- **Token Expiration**: 24-hour expiration window
- **One-Time Use**: Tokens can only be used once
- **Rate Limiting**: Maximum 3 reset requests per hour per user
- **Email Notifications**: HTML-formatted reset emails
- **Token Cleanup**: Automatic cleanup of expired tokens

### Implementation

**Service**: `server/services/passwordRecoveryService.ts`

Key Methods:
- `generateToken()` - Generates secure 64-character hex token
- `requestReset()` - Initiates password reset process
- `verifyToken()` - Validates reset token
- `resetPassword()` - Resets password with token
- `cleanupExpiredTokens()` - Removes expired tokens
- `getRecoveryStatus()` - Gets rate limit status for user

**Database Table**: `passwordRecovery`
```sql
- id: INT AUTO_INCREMENT PRIMARY KEY
- userId: INT NOT NULL
- token: VARCHAR(500) NOT NULL
- expiresAt: TIMESTAMP NOT NULL
- usedAt: TIMESTAMP (nullable)
- createdAt: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Email Integration**:
- Uses existing `sendEmail()` function from `server/email.ts`
- HTML-formatted emails with reset link
- Includes expiration time and security notice

### Configuration
- TOKEN_EXPIRATION_MS: 24 hours (86,400,000 ms)
- RATE_LIMIT_WINDOW_MS: 1 hour (3,600,000 ms)
- MAX_REQUESTS_PER_HOUR: 3

### Email Template
```html
<h2>Password Reset Request</h2>
<p>Hello [User Name],</p>
<p>We received a request to reset your password. Click the link below to proceed:</p>
<p><a href="[RESET_URL]">Reset Password</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you did not request this, you can safely ignore this email.</p>
```

---

## Integration with Authentication Flow

### Login Process with Security Checks

```
1. User submits username/password
2. Check if account is locked (brute-force protection)
   - If locked: Return error with lockout time
3. Find user by username
   - If not found: Record failed attempt, return error
4. Verify password
   - If invalid: 
     - Increment failed attempt count
     - If count >= 5: Lock account for 15 minutes
     - Record failed attempt
     - Return error
5. Generate tokens and create session
6. Clear failed attempts for this user
7. Record successful login attempt
8. Return user data and token
```

### Password Change Flow

```
1. User submits current password and new password
2. Verify current password
3. Validate new password strength
4. Hash new password
5. Update password in database
6. Mark temporary password flag as false (if applicable)
7. Return success message
```

---

## Security Best Practices Implemented

### 1. **Brute-Force Protection**
- ✅ Rate limiting on login attempts
- ✅ Account lockout mechanism
- ✅ IP-based tracking
- ✅ Automatic unlock after timeout

### 2. **Password Security**
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, numbers, special chars)
- ✅ Password hashing with bcrypt
- ✅ Temporary passwords on account creation
- ✅ Mandatory password change on first login

### 3. **2FA Security**
- ✅ TOTP-based authentication (time-based)
- ✅ Backup codes for account recovery
- ✅ QR code for easy setup
- ✅ Clock skew tolerance (2 time windows)

### 4. **Password Recovery Security**
- ✅ Cryptographically secure tokens
- ✅ Token expiration (24 hours)
- ✅ One-time use tokens
- ✅ Rate limiting (3 requests/hour)
- ✅ Email verification

### 5. **Audit & Monitoring**
- ✅ All login attempts recorded
- ✅ Failed attempt tracking
- ✅ IP address logging
- ✅ User agent logging
- ✅ Statistics available for admins

---

## Remaining Implementation Tasks

### Frontend Components (To Be Built)
- [ ] **TwoFactorSetup** - Component for enabling 2FA
- [ ] **TwoFactorVerification** - Component for verifying TOTP during login
- [ ] **PasswordRecovery** - Component for requesting password reset
- [ ] **ResetPassword** - Component for resetting password with token

### tRPC Endpoints (To Be Added)
- [ ] `auth.requestPasswordReset()` - Request password reset
- [ ] `auth.verifyResetToken()` - Verify reset token validity
- [ ] `auth.resetPassword()` - Reset password with token
- [ ] `auth.enableTwoFactor()` - Enable 2FA for user
- [ ] `auth.disableTwoFactor()` - Disable 2FA for user
- [ ] `auth.getTwoFactorStatus()` - Get 2FA status
- [ ] `auth.verifyTwoFactor()` - Verify TOTP token during login
- [ ] `admin.getLoginAttempts()` - Get login attempt history
- [ ] `admin.resetAccountLockout()` - Reset account lockout

### Database Tables (To Be Created)
- [ ] `twoFactorSecrets` - Store encrypted TOTP secrets
- [ ] `twoFactorBackupCodes` - Store backup codes

### UI Updates
- [ ] Add "Forgot Password?" link to login page
- [ ] Add 2FA setup to user settings
- [ ] Add login attempt history to admin dashboard
- [ ] Add account lockout management to admin panel
- [ ] Display lockout message on login page

---

## Testing Recommendations

### Brute-Force Protection Tests
```typescript
- Test: 5 failed attempts locks account
- Test: Locked account cannot login
- Test: Account unlocks after 15 minutes
- Test: Successful login clears failed attempts
- Test: Admin can manually reset lockout
```

### 2FA Tests
```typescript
- Test: TOTP token generation
- Test: TOTP token verification
- Test: QR code generation
- Test: Backup code generation
- Test: Backup code verification
- Test: 2FA enable/disable
```

### Password Recovery Tests
```typescript
- Test: Reset token generation
- Test: Reset email sending
- Test: Token expiration (24 hours)
- Test: One-time use enforcement
- Test: Rate limiting (3/hour)
- Test: Password reset with valid token
- Test: Password reset with invalid token
```

---

## Configuration & Environment Variables

### Required Environment Variables
```
FRONTEND_URL=https://vendhub.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Service Configuration (In Code)
```typescript
// Brute-Force Protection
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Password Recovery
TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 hours
RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
MAX_REQUESTS_PER_HOUR = 3

// 2FA
TOKEN_WINDOW = 2 // 30-second tolerance on each side
```

---

## Security Considerations

### Threat Model
- **Brute-Force Attacks**: Mitigated by account lockout
- **Credential Stuffing**: Mitigated by rate limiting and lockout
- **Password Reuse**: Mitigated by strong password requirements
- **Account Takeover**: Mitigated by 2FA and password recovery verification
- **Token Reuse**: Mitigated by one-time use tokens
- **Token Interception**: Mitigated by HTTPS and secure token generation

### Future Enhancements
1. **IP-Based Rate Limiting**: Limit login attempts per IP address
2. **Suspicious Activity Detection**: Flag unusual login patterns
3. **Device Fingerprinting**: Track trusted devices
4. **Session Management**: Implement session timeout and device management
5. **Audit Logging**: Comprehensive audit trail of security events
6. **SMS 2FA**: Add SMS-based 2FA as alternative
7. **WebAuthn**: Support hardware security keys

---

## Files Created/Modified

### New Files
- `server/services/loginAttemptService.ts` - Brute-force protection service
- `server/services/twoFactorService.ts` - 2FA service
- `server/services/passwordRecoveryService.ts` - Password recovery service
- `SECURITY_FEATURES.md` - This documentation

### Modified Files
- `server/routers/auth.ts` - Added brute-force protection to login endpoint
- `server/db-auth.ts` - Added `updateUserTemporaryPassword()` function
- `package.json` - Added speakeasy and qrcode dependencies

---

## References

### Libraries Used
- **speakeasy** - TOTP generation and verification
- **qrcode** - QR code generation
- **bcrypt** - Password hashing
- **nodemailer** - Email sending
- **drizzle-orm** - Database ORM

### Standards
- **TOTP**: RFC 6238 - Time-Based One-Time Password Algorithm
- **HMAC**: RFC 2104 - HMAC: Keyed-Hashing for Message Authentication
- **SHA-1**: RFC 3174 - US Secure Hash Algorithm

---

## Support & Maintenance

### Monitoring
- Monitor login attempt statistics regularly
- Review failed login patterns for suspicious activity
- Check password recovery request rates
- Monitor 2FA adoption rate

### Maintenance Tasks
- Run `PasswordRecoveryService.cleanupExpiredTokens()` daily
- Review and update security policies quarterly
- Audit security logs monthly
- Test disaster recovery procedures

---

**Last Updated**: December 1, 2025
**Version**: 1.0.0
**Status**: Core Services Implemented, Frontend Integration Pending
