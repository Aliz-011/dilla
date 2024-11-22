import { cookies } from 'next/headers';
import { cache } from 'react';
import { count, eq } from 'drizzle-orm';

import {
  SessionValidationResult,
  validateSessionToken,
} from './server/session';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';

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
  const [data] = await db
    .select({
      id: users.id,
      email: users.email,
      nrp: users.nrp,
      role: users.role,
    })
    .from(users)
    .where(eq(users.nrp, nrp));

  if (!data) {
    return null;
  }

  return data;
};

export const getUserHashedPassword = async (userId: string) => {
  const [user] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, userId));

  return user.password;
};

export const checkEmailAvailability = async (email: string) => {
  const data = await db
    .select({ count: count(users.email) })
    .from(users)
    .where(eq(users.email, email));

  if (data[0].count > 0) {
    throw new Error();
  }

  return data[0].count === 0;
};
