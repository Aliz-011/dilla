import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { CapturePhoto } from '../capture-photo';

import { getCurrentSession } from '@/lib/auth';
import { db } from '@/database/drizzle';
import { attendances } from '@/database/schema';

const AttendanceIdPage = async ({
  params: { attendanceId },
}: {
  params: { attendanceId: string };
}) => {
  const { session } = await getCurrentSession();

  if (!session) {
    redirect('/sign-in');
  }

  const [attendance] = await Promise.all([
    db.query.attendances.findFirst({
      where: eq(attendances.id, attendanceId),
    }),
  ]);

  return (
    <CapturePhoto attendanceId={attendanceId} initialValues={attendance} />
  );
};
export default AttendanceIdPage;
