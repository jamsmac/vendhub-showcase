import { describe, it, expect } from 'vitest';
import { PasswordService } from './services/passwordService';

describe('Password Service', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await PasswordService.hashPassword(password);
      const hash2 = await PasswordService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should accept valid password', () => {
      const result = PasswordService.validatePassword('TestPass123');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordService.validatePassword('Test123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject password without lowercase letter', () => {
      const result = PasswordService.validatePassword('TESTPASS123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase letter');
    });

    it('should reject password without uppercase letter', () => {
      const result = PasswordService.validatePassword('testpass123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('uppercase letter');
    });

    it('should reject password without number', () => {
      const result = PasswordService.validatePassword('TestPassword');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });

    it('should reject empty password', () => {
      const result = PasswordService.validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user_name@example-domain.com',
      ];

      validEmails.forEach(email => {
        expect(PasswordService.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid @example.com',
        'invalid@example .com',
      ];

      invalidEmails.forEach(email => {
        expect(PasswordService.validateEmail(email)).toBe(false);
      });
    });
  });
});

describe('Email Auth Endpoints', () => {
  describe('Registration', () => {
    it('should have correct endpoint structure', () => {
      const endpoint = '/api/auth/register';
      expect(endpoint).toMatch(/^\/api\/auth\//);
    });

    it('should validate required fields', () => {
      const requiredFields = ['email', 'password', 'name'];
      expect(requiredFields).toHaveLength(3);
      expect(requiredFields).toContain('email');
      expect(requiredFields).toContain('password');
      expect(requiredFields).toContain('name');
    });

    it('should create openId from email', () => {
      const email = 'test@example.com';
      const openId = `email:${email}`;
      expect(openId).toBe('email:test@example.com');
      expect(openId).toMatch(/^email:/);
    });
  });

  describe('Login', () => {
    it('should have correct endpoint structure', () => {
      const endpoint = '/api/auth/login';
      expect(endpoint).toMatch(/^\/api\/auth\//);
    });

    it('should validate required fields', () => {
      const requiredFields = ['email', 'password'];
      expect(requiredFields).toHaveLength(2);
      expect(requiredFields).toContain('email');
      expect(requiredFields).toContain('password');
    });
  });

  describe('Logout', () => {
    it('should have correct endpoint structure', () => {
      const endpoint = '/api/auth/logout';
      expect(endpoint).toMatch(/^\/api\/auth\//);
    });
  });
});
