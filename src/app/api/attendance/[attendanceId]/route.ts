import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfToday,
} from 'date-fns';

import { db } from '@/database/drizzle';
import { getCurrentSession } from '@/lib/auth';
import { attendances, users } from '@/database/schema';

export async function GET(
  req: NextRequest,
  { params: { attendanceId } }: { params: { attendanceId: string } }
) {
  try {
    const { session, user } = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attendance = await db.query.attendances.findFirst({
      where: eq(attendances.id, attendanceId),
      with: {
        user: {
          columns: {
            id: true,
            nrp: true,
          },
          with: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params: { attendanceId } }: { params: { attendanceId: string } }
) {
  try {
    const { session, user } = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as unknown as File;
    const action = formData.get('action');

    if (!file) {
      return NextResponse.json(
        { error: 'No files received.' },
        { status: 400 }
      );
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const checkOutWindow = {
      start: setMinutes(setHours(today, 16), 0),
      end: setMinutes(setHours(today, 17), 0),
    };

    if (
      action === 'check-out' &&
      !isWithinInterval(new Date(), checkOutWindow)
    ) {
      return NextResponse.json(
        { error: 'Check-out time has passed' },
        { status: 400 }
      );
    }

    const [existingAttendance] = await db
      .select()
      .from(attendances)
      .where(
        and(
          eq(attendances.userId, user.id),
          eq(attendances.date, new Date(today))
        )
      );

    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'No check-in record found for today' },
        { status: 400 }
      );
    }

    // await db
    //     .update(attendances)
    //     .set({ checkOutTime: format(new Date(), 'HH:mm:ss') })
    //     .where(and(eq(attendances.id, attendanceId), eq(users.id, )));
    return NextResponse.json({ message: 'Check-out recorded successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
