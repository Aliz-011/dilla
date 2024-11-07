import path from 'path';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfToday,
} from 'date-fns';

import { db } from '@/database/drizzle';
import { attendances } from '@/database/schema';
import { getCurrentSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  {
    params: { attendanceId, userId },
  }: { params: { userId: string; attendanceId: string } }
) {
  try {
    const { session } = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    const attendance = await db.query.attendances.findFirst({
      where: and(
        eq(attendances.id, attendanceId),
        eq(attendances.userId, userId),
        eq(attendances.date, new Date(today))
      ),
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
    });

    if (!attendance) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: attendance });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params: { attendanceId, userId },
  }: { params: { userId: string; attendanceId: string } }
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

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    await writeFile(filePath, buffer);

    const today = format(new Date(), 'yyyy-MM-dd');

    const checkOutWindow = {
      start: setMinutes(setHours(startOfToday(), 16), 0),
      end: setMinutes(setHours(startOfToday(), 17), 0),
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

    const existingAttendance = await db.query.attendances.findFirst({
      where: and(
        eq(attendances.id, attendanceId),
        eq(attendances.userId, userId),
        eq(attendances.date, new Date(today))
      ),
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
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'No check-in record found for today' },
        { status: 400 }
      );
    }

    await db
      .update(attendances)
      .set({
        checkOutTime: format(new Date(), 'HH:mm:ss'),
        status: 'present',
      })
      .where(
        and(
          eq(attendances.id, existingAttendance.id),
          eq(attendances.userId, userId) // TODO: Decide if it needs to check the user has to match or just using attendance' id
        )
      );

    return NextResponse.json({ data: existingAttendance });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
