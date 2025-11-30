import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbAuth from "../db-auth";
import { PasswordService } from "../services/passwordService";
import { TokenService } from "../services/tokenService";

export const passwordRecoveryRouter = router({
  /**
   * Request password reset token
   * Sends email with reset link
   */
  requestReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      // Find user
      const user = await dbAuth.getUserByEmail(input.email);
      if (!user) {
        // Don't reveal if email exists (security best practice)
        return {
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        };
      }

      // Generate reset token
      const token = TokenService.generatePasswordResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Save token to database
      await dbAuth.createPasswordRecoveryToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // TODO: Send email with reset link
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      // await sendPasswordResetEmail(user.email, resetLink);

      return {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      };
    }),

  /**
   * Verify reset token validity
   */
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const recoveryRecord = await dbAuth.getPasswordRecoveryToken(input.token);

      if (!recoveryRecord) {
        return {
          valid: false,
          message: "Invalid or expired reset token",
        };
      }

      // Check if token is expired
      if (TokenService.isTokenExpired(new Date(recoveryRecord.expiresAt))) {
        return {
          valid: false,
          message: "Reset token has expired",
        };
      }

      return {
        valid: true,
        message: "Token is valid",
      };
    }),

  /**
   * Reset password with valid token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      // Get recovery record
      const recoveryRecord = await dbAuth.getPasswordRecoveryToken(input.token);

      if (!recoveryRecord) {
        throw new Error("Invalid or expired reset token");
      }

      // Check if token is expired
      if (TokenService.isTokenExpired(new Date(recoveryRecord.expiresAt))) {
        throw new Error("Reset token has expired");
      }

      // Validate passwords match
      if (input.newPassword !== input.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(
        input.newPassword
      );
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      // Hash new password
      const passwordHash = await PasswordService.hashPassword(input.newPassword);

      // Update user password
      await dbAuth.updateUserPassword(recoveryRecord.userId, passwordHash);

      // Mark token as used
      await dbAuth.markPasswordRecoveryTokenAsUsed(input.token);

      return {
        success: true,
        message: "Password has been reset successfully. Please log in.",
      };
    }),

  /**
   * Resend password reset email
   */
  resendResetEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const user = await dbAuth.getUserByEmail(input.email);
      if (!user) {
        return {
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        };
      }

      // Generate new reset token
      const token = TokenService.generatePasswordResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await dbAuth.createPasswordRecoveryToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // TODO: Send email with reset link
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      // await sendPasswordResetEmail(user.email, resetLink);

      return {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      };
    }),
});
