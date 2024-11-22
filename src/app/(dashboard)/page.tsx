'use client';

import { Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { format, parse } from 'date-fns';

import { DataTable } from '@/components/data-table';
import { columns } from './columns';

import { useGetAttendances } from '@/hooks/attendance/use-get-attendances';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';

export default function Home() {
  const { data, isLoading, isError } = useGetAttendances();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (isError) {
    return (
      <main className="max-w-screen-2xl flex items-center justify-center mx-auto size-full">
        <p className="text-sm">Something wnet wrong</p>
      </main>
    );
  }

  if (isLoading || !data) {
    return (
      <main className="max-w-screen-2xl flex items-center justify-center mx-auto size-full">
        <Loader className="animate-spin size-6" />
      </main>
    );
  }

  const onExport = () => {
    try {
      setLoading(true);
      const dataToExport = data.map((attendance) => ({
        nrp: attendance.user.nrp,
        date: format(new Date(attendance.date), 'PPP'),
        checkIn: attendance.checkInTime
          ? format(
              parse(attendance.checkInTime!, 'HH:mm:ss', new Date()),
              'kk:mm'
            )
          : null,
        checkOut: attendance.checkOutTime
          ? format(
              parse(attendance.checkOutTime!, 'HH:mm:ss', new Date()),
              'kk:mm'
            )
          : null,
        status: attendance.status,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      XLSX.utils.book_append_sheet(workbook, worksheet);

      XLSX.writeFile(workbook, `attendances.xlsx`);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-screen-2xl mx-auto w-full">
      <div className="space-y-4">
        {session?.role === 'admin' && (
          <div className="w-full">
            <Button size="sm" disabled={loading} onClick={onExport}>
              Export to xlsx
            </Button>
          </div>
        )}
        <DataTable columns={columns} data={data} />
      </div>
    </main>
  );
}
