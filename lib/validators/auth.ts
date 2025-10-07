import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }),
});

export type LoginData = z.infer<typeof LoginSchema>;


export const RegisterSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy.',
  }),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
