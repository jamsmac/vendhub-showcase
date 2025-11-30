import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbAuth from "../db-auth";
import { PasswordService } from "../services/passwordService";
import { TokenService } from "../services/tokenService";
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
      // Find user by username
      const user = await dbAuth.getUserByUsername(input.username);
      if (!user) {
        throw new Error("Invalid username or password");
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(
        input.password,
        user.passwordHash || ""
      );
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
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
        ipAddress: ctx.req?.ip,
        userAgent: ctx.req?.headers["user-agent"],
      });

      // Update last signed in
      await dbAuth.updateLastSignedIn(user.id);

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
