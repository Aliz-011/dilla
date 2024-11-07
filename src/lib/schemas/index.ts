import * as z from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().min(1),
  nrp: z.string().trim().min(3),
  password: z.string().min(8).max(255),
});

export const LoginSchema = z.object({
  nrp: z.string().trim().min(1),
  password: z.string().min(1, 'Please enter a password'),
});
