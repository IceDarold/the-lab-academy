import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }),
});

export type LoginData = z.infer<typeof LoginSchema>;


export const RegisterSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().regex(/^[^\s@]+@[^\s@]/, { message: 'Invalid email format' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy.',
  }),
});

export type RegisterData = z.infer<typeof RegisterSchema>;

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
});

export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Apply error to the confirmPassword field
});

export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Invalid email format' }),
});

export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;