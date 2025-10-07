import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/i, { message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }),
});

export type LoginData = z.infer<typeof LoginSchema>;


const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

const sanitizeEmail = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/\p{Cf}/gu, "") // убираем форматные символы: ZWSP/BOM/BiDi
    .replace(/\s/gu, "")     // убираем любые пробелы, включая NBSP
    .toLowerCase();

export const RegisterSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z
    .string()
    .transform(sanitizeEmail)
    .regex(EMAIL_REGEX, { message: "Invalid email format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  terms: z.boolean().refine(Boolean, {
    message: "You must agree to the terms and privacy policy.",
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
  email: z.string().trim().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/i, { message: 'Invalid email format' }),
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