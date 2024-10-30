import { cookies } from 'next/headers';
import { cache } from 'react';

import {
  SessionValidationResult,
  validateSessionToken,
} from './server/session';
import { db } from '@/database/drizzle';

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = cookies();
    const token = cookieStore.get('dilla-session')?.value ?? null;

    if (token === null) {
      return { session: null, user: null };
    }

    const result = await validateSessionToken(token);

    return result;
  }
);

export const getUserByNrp = async (nrp: string) => {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.nrp, nrp),
  });

  return user;
};

export const checkEmailAvailability = async (email: string) => {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  return !!user;
};
