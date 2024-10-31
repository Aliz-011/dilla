import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth';
import { CapturePhoto } from './capture-photo';

const AttendencePage = async () => {
  const { session } = await getCurrentSession();

  if (!session) {
    redirect('/sign-in');
  }

  return <CapturePhoto />;
};
export default AttendencePage;
