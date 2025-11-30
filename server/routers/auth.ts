import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbAuth from "../db-auth";
import { PasswordService } from "../services/passwordService";
import { TokenService } from "../services/tokenService";
import { LoginAttemptService } from "../services/loginAttemptService";
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
});
