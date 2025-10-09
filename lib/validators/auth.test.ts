import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  RegisterSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type LoginData,
  type RegisterData,
  type UpdateProfileData,
  type ChangePasswordData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from './auth'

describe('Auth Validators', () => {
  describe('LoginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = LoginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = LoginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Invalid email format')
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = LoginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Password cannot be empty')
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = LoginSchema.safeParse(validData)
      if (result.success) {
        const data: LoginData = result.data
        expect(data.email).toBe('test@example.com')
        expect(data.password).toBe('password123')
      }
    })

    // Comprehensive email validation tests
    describe('Email validation edge cases', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.com',
        'user-name@example.com',
        'user123@example.com',
        '123user@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example.io',
        'user@example.travel',
        'user@example.museum',
        'akonukhov@isl.cy',
        'test.email+tag@example.com',
      ]

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@@example.com',
        'user example.com',
        'user@.com',
        'user@exam ple.com',
        'user@exam ple.com',
        'user@exam\tple.com',
        'user@exam\nple.com',
      ]

      validEmails.forEach(email => {
        it(`should accept valid email: ${email}`, () => {
          const result = LoginSchema.safeParse({ email, password: 'password123' })
          expect(result.success).toBe(true)
        })
      })

      invalidEmails.forEach(email => {
        it(`should reject invalid email: ${email}`, () => {
          const result = LoginSchema.safeParse({ email, password: 'password123' })
          expect(result.success).toBe(false)
          expect(result.error?.issues[0]?.message).toBe('Invalid email format')
        })
      })
    })
  })

  describe('RegisterSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should validate email with subdomain like akonukhov@isl.cy', () => {
      const validData = {
        fullName: 'John Doe',
        email: 'akonukhov@isl.cy',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data.email).toBe('akonukhov@isl.cy')
    })

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        fullName: 'J',
        email: 'john@example.com',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Name must be at least 2 characters long')
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        terms: true,
      }

      const result = RegisterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Password must be at least 8 characters long')
    })

    it('should reject unchecked terms', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        terms: false,
      }

      const result = RegisterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('You must agree to the terms and privacy policy.')
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(validData)
      if (result.success) {
        const data: RegisterData = result.data
        expect(data.fullName).toBe('John Doe')
        expect(data.terms).toBe(true)
      }
    })

    it('should reject fullName containing "test"', () => {
      const invalidData = {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Full name cannot contain \'test\'')
    })

    it('should reject fullName containing "Test" (case insensitive)', () => {
      const invalidData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        terms: true,
      }

      const result = RegisterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Full name cannot contain \'test\'')
    })

    it('should reject fullName containing "test" in any case', () => {
      const testCases = [
        'TEST User',
        'tEsT User',
        'testuser',
        'User test',
        'TeSt',
      ]

      testCases.forEach(fullName => {
        const invalidData = {
          fullName,
          email: 'test@example.com',
          password: 'password123',
          terms: true,
        }

        const result = RegisterSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.message).toBe('Full name cannot contain \'test\'')
      })
    })
  })

  describe('UpdateProfileSchema', () => {
    it('should validate valid profile update data', () => {
      const validData = {
        fullName: 'Jane Doe',
      }

      const result = UpdateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        fullName: 'J',
      }

      const result = UpdateProfileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Name must be at least 2 characters long')
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        fullName: 'Jane Doe',
      }

      const result = UpdateProfileSchema.safeParse(validData)
      if (result.success) {
        const data: UpdateProfileData = result.data
        expect(data.fullName).toBe('Jane Doe')
      }
    })
  })

  describe('ChangePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ChangePasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject empty current password', () => {
      const invalidData = {
        currentPassword: '',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ChangePasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Current password is required')
    })

    it('should reject new password shorter than 8 characters', () => {
      const invalidData = {
        currentPassword: 'oldpassword',
        newPassword: 'short',
        confirmPassword: 'short',
      }

      const result = ChangePasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('New password must be at least 8 characters')
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      }

      const result = ChangePasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Passwords do not match')
      expect(result.error?.issues[0]?.path).toEqual(['confirmPassword'])
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ChangePasswordSchema.safeParse(validData)
      if (result.success) {
        const data: ChangePasswordData = result.data
        expect(data.currentPassword).toBe('oldpassword')
        expect(data.newPassword).toBe('newpassword123')
      }
    })
  })

  describe('ForgotPasswordSchema', () => {
    it('should validate valid forgot password data', () => {
      const validData = {
        email: 'test@example.com',
      }

      const result = ForgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
      }

      const result = ForgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Invalid email format')
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        email: 'test@example.com',
      }

      const result = ForgotPasswordSchema.safeParse(validData)
      if (result.success) {
        const data: ForgotPasswordData = result.data
        expect(data.email).toBe('test@example.com')
      }
    })
  })

  describe('ResetPasswordSchema', () => {
    it('should validate valid reset password data', () => {
      const validData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ResetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject empty token', () => {
      const invalidData = {
        token: '',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Reset token is required')
    })

    it('should reject new password shorter than 8 characters', () => {
      const invalidData = {
        token: 'reset-token-123',
        newPassword: 'short',
        confirmPassword: 'short',
      }

      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Password must be at least 8 characters long')
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      }

      const result = ResetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Passwords do not match')
      expect(result.error?.issues[0]?.path).toEqual(['confirmPassword'])
    })

    it('should correctly type the parsed data', () => {
      const validData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      const result = ResetPasswordSchema.safeParse(validData)
      if (result.success) {
        const data: ResetPasswordData = result.data
        expect(data.token).toBe('reset-token-123')
        expect(data.newPassword).toBe('newpassword123')
      }
    })
  })
})