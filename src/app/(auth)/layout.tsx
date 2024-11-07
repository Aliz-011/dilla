'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';

const AuthLayout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  return (
    <main className="h-screen bg-neutral-100 dark:bg-neutral-800">
      <div className="mx-auto max-w-screen-2xl flex flex-col justify-center items-center h-full p-4">
        {/* <nav className="flex justify-between items-center">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />

          <Button variant="secondary" asChild>
            <Link href={pathname === '/sign-in' ? '/sign-up' : 'sign-in'}>
              {pathname === '/sign-in' ? 'Register' : 'Login'}
            </Link>
          </Button>
        </nav> */}

        <div className="flex flex-col items-center justify-center pt-8 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  );
};
export default AuthLayout;
