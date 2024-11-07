import { and, desc, gte, lte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { differenceInDays, parse, subDays } from 'date-fns';

import { db } from '@/database/drizzle';
import { attendances as attendancesSchema } from '@/database/schema';
import { getCurrentSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { session } = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const from = req.nextUrl.searchParams.get('from') || '';
    const to = req.nextUrl.searchParams.get('to') || '';

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, 'yyyy-MM-dd', new Date())
      : defaultFrom;
    const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    const attendances = await db.query.attendances.findMany({
      orderBy: desc(attendancesSchema.date),
      with: {
        user: {
          columns: {
            nrp: true,
          },
          with: {
            profile: true,
          },
        },
      },
      where: and(
        gte(attendancesSchema.date, startDate),
        lte(attendancesSchema.date, endDate)
      ),
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erorr: 'Internal error' }, { status: 500 });
  }
}
