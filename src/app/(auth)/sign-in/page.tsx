import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth';
import { SignInCard } from './sign-in-card';

const SignInPage = async () => {
  const { session } = await getCurrentSession();

  if (session !== null) {
    return redirect('/');
  }

  return <SignInCard />;
};
export default SignInPage;
