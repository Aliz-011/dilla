'use server';

import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth';
import {
  deleteSessionTokenCookie,
  invalidateSession,
} from '@/lib/server/session';

export const logout = async () => {
  const { session } = await getCurrentSession();

  if (!session) {
    return { message: 'Unauthorized' };
  }

  invalidateSession(session.id);
  deleteSessionTokenCookie();

  return redirect('/sign-in');
};
