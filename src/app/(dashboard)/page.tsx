'use client';

import { Loader } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { columns } from './columns';

import { useGetAttendances } from '@/hooks/attendance/use-get-attendances';

export default function Home() {
  const { data, isLoading, isError } = useGetAttendances();

  if (isLoading || !data) {
    return (
      <main className="max-w-screen-2xl flex items-center justify-center mx-auto size-full">
        <Loader className="animate-spin size-6" />
      </main>
    );
  }

  return (
    <main className="max-w-screen-2xl mx-auto w-full">
      <DataTable columns={columns} data={data} />
    </main>
  );
}
