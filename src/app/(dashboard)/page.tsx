import { LogoutButton } from '@/components/logout-button';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { session } = await getCurrentSession();

  if (session === null) {
    redirect('/sign-in');
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Hello world</h1>
      <LogoutButton />
    </main>
  );
}
