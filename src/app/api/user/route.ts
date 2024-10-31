import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, user } = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password, ...data } = user;

    return NextResponse.json({ ...data });
  } catch (error) {
    console.error('Internal Server Error', error);
  }
}
