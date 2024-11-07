import { PropsWithChildren } from 'react';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DashboardSidebar } from './sidebar';

import { getCurrentSession } from '@/lib/auth';
import { DateFilters } from '@/components/date-filters';

const DashboardLayout = async ({ children }: PropsWithChildren) => {
  const { session, user } = await getCurrentSession();

  if (session === null) {
    redirect('/sign-in');
  }

  return (
    <SidebarProvider>
      <DashboardSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm">{format(new Date(), 'MMMM y')}</span>
          </div>
          <DateFilters />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
export default DashboardLayout;
