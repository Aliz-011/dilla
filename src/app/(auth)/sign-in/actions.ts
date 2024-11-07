'use server';

import { z } from 'zod';

import { LoginSchema } from '@/lib/schemas';
import { getUserByNrp } from '@/lib/auth';
import { verifyPasswordHash } from '@/lib/utils';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/server/session';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Please enter NRP and password' };
  }

  const { nrp, password } = validatedFields.data;

  const user = await getUserByNrp(nrp);

  if (!user || !user.password) {
    return {
      error: 'Account does not exist',
    };
  }

  const validPassword = await verifyPasswordHash(user.password, password);

  if (!validPassword) {
    return { error: 'Invalid NRP or password' };
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);

  return { success: true, message: 'Logged in!' };
};

interface ActionResult {
  message: string;
}
