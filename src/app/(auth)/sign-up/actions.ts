'use server';

import { z } from 'zod';
import { nanoid } from 'nanoid';

import { db } from '@/database/drizzle';
import { checkEmailAvailability, getUserByNrp } from '@/lib/auth';
import { RegisterSchema } from '@/lib/schemas';
import { hashPassword, verifyPasswordStrength } from '@/lib/utils';
import { profiles, users } from '@/database/schema';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/server/session';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      message: 'Please fill all the fields!',
    };
  }

  const { email, nrp, password } = validatedFields.data;

  const strongPassword = await verifyPasswordStrength(password);
  console.log(strongPassword);

  if (!strongPassword) {
    return {
      message: 'Password too weak',
    };
  }

  const emailAvailable = await checkEmailAvailability(email);

  if (!emailAvailable) {
    return {
      message: 'Email already taken',
    };
  }

  const existingNrp = await getUserByNrp(nrp);

  if (existingNrp) {
    return {
      message: 'NRP already exists',
    };
  }
  console.log(existingNrp);

  const hashPwd = await hashPassword(password);
  console.log(hashPwd);

  const [user] = await db
    .insert(users)
    .values({
      id: nanoid(),
      email,
      nrp,
      password: hashPwd,
      createdAt: new Date(),
    })
    .returning();

  console.log(user);

  await db.insert(profiles).values({
    id: nanoid(),
    userId: user.id,
    createdAt: new Date(),
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);

  const { password: userPassword, ...data } = user;

  return data;
};
