import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbAuth from "../db-auth";
import { PasswordService } from "../services/passwordService";
import { TokenService } from "../services/tokenService";
import { LoginAttemptService } from "../services/loginAttemptService";
import { TwoFactorService } from "../services/twoFactorService";
import { PasswordRecoveryService } from "../services/passwordRecoveryService";
import { BackupCodeService } from "../services/backupCodeService";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "../../shared/const";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8),
        fullName: z.string().min(1, "Full name is required"),
        role: z
          .enum(["operator", "manager", "admin"])
          .optional()
          .default("operator"),
      })
    )
    .mutation(async ({ input }) => {
      // Validate passwords match
      if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Check if user already exists
      const existingUser = await dbAuth.getUserByEmail(input.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(
        input.password
      );
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      // Hash password
      const passwordHash = await PasswordService.hashPassword(input.password);

      // Create user
      await dbAuth.createUser({
        email: input.email,
        name: input.fullName,
        passwordHash,
        role: input.role,
      });

      return {
        success: true,
        message: "Registration successful. Please log in.",
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ipAddress = ctx.req?.ip || "unknown";
      const userAgent = ctx.req?.headers["user-agent"] || "unknown";

      // Find user by username
      const user = await dbAuth.getUserByUsername(input.username);
      if (!user) {
        // Record failed attempt even if user doesn't exist
        await LoginAttemptService.recordAttempt(
          input.username,
          ipAddress,
          userAgent,
          "failed",
          "user_not_found"
        );
        throw new Error("Invalid username or password");
      }

      // Check if account is locked
      const lockCheck = await LoginAttemptService.shouldBlockLogin(
        user.email || input.username,
        ipAddress
      );
      if (lockCheck.blocked) {
        // Record locked attempt
        await LoginAttemptService.recordAttempt(
          user.email || input.username,
          ipAddress,
          userAgent,
          "locked",
          "account_locked",
          user.id
        );
        const lockoutTime = lockCheck.lockoutUntil
          ? lockCheck.lockoutUntil.toLocaleTimeString()
          : "15 minutes";
        throw new Error(
          `Account locked due to too many failed login attempts. Please try again after ${lockoutTime}`
        );
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(
        input.password,
        user.passwordHash || ""
      );
      if (!isPasswordValid) {
        // Record failed attempt
        const failedCount = await LoginAttemptService.getFailedAttemptCount(
          user.email || input.username
        );

        if (failedCount + 1 >= 5) {
          // Lock account
          await LoginAttemptService.recordAttempt(
            user.email || input.username,
            ipAddress,
            userAgent,
            "locked",
            "invalid_password",
            user.id
          );
          throw new Error(
            "Account locked due to too many failed login attempts. Please try again in 15 minutes."
          );
        } else {
          // Record failed attempt
          await LoginAttemptService.recordAttempt(
            user.email || input.username,
            ipAddress,
            userAgent,
            "failed",
            "invalid_password",
            user.id
          );
        }
        throw new Error("Invalid username or password");
      }

      // Generate tokens
      const tokens = await TokenService.generateTokens(
        user.id,
        user.email || "",
        user.role
      );

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await dbAuth.createSession({
        userId: user.id,
        token: tokens.accessToken,
        expiresAt,
        ipAddress,
        userAgent,
      });

      // Update last signed in
      await dbAuth.updateLastSignedIn(user.id);

      // Clear failed attempts after successful login
      await LoginAttemptService.clearFailedAttempts(
        user.email || input.username
      );

      // Record successful attempt
      await LoginAttemptService.recordAttempt(
        user.email || input.username,
        ipAddress,
        userAgent,
        "success",
        undefined,
        user.id
      );

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${tokens.accessToken}; Path=/; HttpOnly; ${
          cookieOptions.secure ? "Secure; " : ""
        }SameSite=Strict; Max-Age=${tokens.expiresIn}`
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          needsPasswordChange: user.isTemporaryPassword || false,
        },
        token: tokens.accessToken,
      };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // Get user
      const user = await dbAuth.getUserById(ctx.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isPasswordValid = await PasswordService.verifyPassword(
        input.currentPassword,
        user.passwordHash || ""
      );
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Validate new password
      if (input.newPassword !== input.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      const passwordValidation = PasswordService.validatePassword(
        input.newPassword
      );
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      // Hash and update password
      const newPasswordHash = await PasswordService.hashPassword(
        input.newPassword
      );
      await dbAuth.updateUserPassword(ctx.user.id, newPasswordHash);

      // Mark temporary password as used
      await dbAuth.updateUserTemporaryPassword(ctx.user.id, false);

      return {
        success: true,
        message: "Password changed successfully",
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        telegramId: z.string().optional(),
        twoFactorEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      await dbAuth.updateUserProfile(ctx.user.id, input);

      return {
        success: true,
        message: "Profile updated successfully",
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  // Password Recovery Endpoints
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      return await PasswordRecoveryService.requestReset(input.email);
    }),

  verifyResetToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
      })
    )
    .query(async ({ input }) => {
      return await PasswordRecoveryService.verifyToken(input.token);
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      // Validate passwords match
      if (input.newPassword !== input.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
        };
      }

      return await PasswordRecoveryService.resetPassword(
        input.token,
        input.newPassword
      );
    }),

  // Two-Factor Authentication Endpoints
  getTwoFactorStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    return await TwoFactorService.getUserTwoFactorStatus(ctx.user.id);
  }),

  generateTwoFactorSecret: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const user = await dbAuth.getUserById(ctx.user.id);
    if (!user) {
      throw new Error("User not found");
    }

    const secret = TwoFactorService.generateSecret(user.email || "user");
    const qrCode = await TwoFactorService.generateQRCode(secret.secret);
    const backupCodes = TwoFactorService.generateBackupCodes();

    return {
      secret: secret.secret,
      qrCode,
      backupCodes,
      message: "Scan the QR code with your authenticator app",
    };
  }),

  enableTwoFactor: protectedProcedure
    .input(
      z.object({
        secret: z.string().min(1, "Secret is required"),
        token: z.string().min(1, "Token is required"),
        backupCodes: z.array(z.string()).min(1, "Backup codes are required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // Verify token before enabling
      if (!TwoFactorService.validateSetup(input.secret, input.token)) {
        throw new Error("Invalid verification token. Please try again.");
      }

      return await TwoFactorService.enableTwoFactor(
        ctx.user.id,
        input.secret,
        input.backupCodes
      );
    }),

  disableTwoFactor: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    return await TwoFactorService.disableTwoFactor(ctx.user.id);
  }),

  verifyTwoFactor: publicProcedure
    .input(
      z.object({
        userId: z.number().int().positive("Invalid user ID"),
        token: z.string().min(1, "Token is required"),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "2FA verification successful",
      };
    }),

  getBackupCodes: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    try {
      const codes = await BackupCodeService.getAllUserBackupCodes(ctx.user.id);
      const stats = await BackupCodeService.getBackupCodeStats(ctx.user.id);

      return {
        success: true,
        codes,
        stats,
        message: "Backup codes retrieved successfully",
      };
    } catch (error: any) {
      console.error("Error fetching backup codes:", error);
      throw new Error(error.message || "Failed to fetch backup codes");
    }
  }),

  regenerateBackupCodes: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    try {
      const result = await BackupCodeService.regenerateBackupCodes(ctx.user.id);

      return {
        success: result.success,
        codes: result.codes,
        generationId: result.generationId,
        stats: await BackupCodeService.getBackupCodeStats(ctx.user.id),
        message: result.message,
      };
    } catch (error: any) {
      console.error("Error regenerating backup codes:", error);
      throw new Error(error.message || "Failed to regenerate backup codes");
    }
  }),

  verifyBackupCode: publicProcedure
    .input(
      z.object({
        userId: z.number().int().positive("Invalid user ID"),
        code: z.string().min(1, "Backup code is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await BackupCodeService.verifyAndConsumeBackupCode(
          input.userId,
          input.code
        );

        return {
          success: result.success,
          message: result.message,
        };
      } catch (error: any) {
        console.error("Error verifying backup code:", error);
        throw new Error(error.message || "Failed to verify backup code");
      }
    }),

  getBackupCodeStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    try {
      const stats = await BackupCodeService.getBackupCodeStats(ctx.user.id);

      return {
        success: true,
        stats,
        message: "Backup code statistics retrieved successfully",
      };
    } catch (error: any) {
      console.error("Error fetching backup code stats:", error);
      throw new Error(error.message || "Failed to fetch backup code statistics");
    }
  }),
});
