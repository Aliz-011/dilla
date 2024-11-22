import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfToday,
} from 'date-fns';
import path from 'path';
import { writeFile } from 'fs/promises';
import fs from 'fs';

import { db } from '@/database/drizzle';
import { getCurrentSession } from '@/lib/auth';
import { attendances, photos, photosToAttendances } from '@/database/schema';
import { nanoid } from 'nanoid';

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
      start: setMinutes(setHours(startOfToday(), 16), 0),
      end: setMinutes(setHours(startOfToday(), 18), 0),
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
          eq(attendances.userId, user.id)
        )
      );

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    await writeFile(filePath, buffer);

    const [photo] = await db
      .insert(photos)
      .values({
        id: nanoid(),
        userId: user.id,
        photoUrl: filename,
        createdAt: new Date(),
      })
      .returning({ id: photos.id });

    await db.insert(photosToAttendances).values({
      attendanceId: existingAttendance.id,
      photoId: photo.id,
    });

    return NextResponse.json({ data: existingAttendance });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
