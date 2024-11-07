import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth';
import { CapturePhoto } from './capture-photo';

const AttendancePage = async () => {
  const { session } = await getCurrentSession();

  if (!session) {
    redirect('/sign-in');
  }

  return <CapturePhoto />;
};
export default AttendancePage;
