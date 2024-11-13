import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { and, eq } from 'drizzle-orm';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfToday,
} from 'date-fns';

import { db } from '@/database/drizzle';
import { attendances, photos, photosToAttendances } from '@/database/schema';
import { getCurrentSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    // 919605900772346873718x127389
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkInWindow = {
      start: setMinutes(setHours(startOfToday(), 7), 0),
      end: setMinutes(setHours(startOfToday(), 10), 0),
    };

    if (action === 'check-in' && !isWithinInterval(new Date(), checkInWindow)) {
      return NextResponse.json(
        { error: 'Check-in time has passed' },
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

    if (existingAttendance) {
      return NextResponse.json({
        error: 'Already checked in today, wait for tommorow.',
      });
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

    // If no record exists, create a new one with the check-in time
    const [attendance] = await db
      .insert(attendances)
      .values({
        id: nanoid(),
        userId: user.id,
        date: new Date(today),
        checkInTime: format(new Date(), 'HH:mm:ss'),
        status: 'present',
      })
      .returning({ id: attendances.id });

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
      attendanceId: attendance.id,
      photoId: photo.id,
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename,
    });
  } catch (error) {
    console.log('Internal Server Error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
