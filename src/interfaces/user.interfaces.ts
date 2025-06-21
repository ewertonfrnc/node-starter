import { z } from 'zod/v4';

export const SignUpSchema = z.object({
  name: z.string().min(3, 'Please, tell us your name'),
  email: z.email('Please, provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  passwordConfirm: z.string().min(8, 'Password confirmation must be at least 8 characters long'),
});

export const LoginSchema = z.object({
  email: z.email('Please, provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type SignUpPayload = z.infer<typeof SignUpSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;
