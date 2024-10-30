'use server';

import { z } from 'zod';
import { nanoid } from 'nanoid';

import { db } from '@/database/drizzle';
import { checkEmailAvailability, getUserByNrp } from '@/lib/auth';
import { RegisterSchema } from '@/lib/schemas';
import { hashPassword, verifyPasswordStrength } from '@/lib/utils';
import { users } from '@/database/schema';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/server/session';
import { redirect } from 'next/navigation';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      message: 'Please fill all the fields!',
    };
  }

  const { email, nrp, password } = validatedFields.data;

  const strongPassword = await verifyPasswordStrength(password);

  if (!strongPassword) {
    return {
      message: 'Password too weak',
    };
  }

  const existingEmail = await checkEmailAvailability(email);

  if (existingEmail) {
    return {
      message: 'Email already taken',
    };
  }

  const existingNrp = await getUserByNrp(nrp);

  if (!!existingNrp) {
    return {
      message: 'NRP already exists',
    };
  }

  const hashPwd = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      id: nanoid(),
      email,
      nrp,
      password: hashPwd,
      role: 'employee',
    })
    .returning();

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);

  return user;
};
