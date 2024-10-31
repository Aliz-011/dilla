import { redirect } from 'next/navigation';
import { addHours, getTime } from 'date-fns';

import { DataTable } from '@/components/data-table';
import { Attendence, columns } from './columns';
import { getCurrentSession } from '@/lib/auth';

async function getData(): Promise<Attendence[]> {
  return [
    {
      id: '728ed52f',
      checkIn: new Date(2024, 9, 29, 8).getTime(),
      checkOut: getTime(addHours(new Date(2024, 9, 29, 8).getTime(), 8)),
      date: new Date(2024, 9, 29),
      employee: 'Dilla',
    },
    {
      id: '728ed52g',
      checkIn: new Date(2024, 9, 30, 7).getTime(),
      checkOut: getTime(addHours(new Date(2024, 9, 30, 7).getTime(), 9)),
      date: new Date(2024, 9, 30),
      employee: 'Dilla',
    },
  ];
}

export default async function Home() {
  const { session } = await getCurrentSession();

  if (session === null) {
    redirect('/sign-in');
  }

  const data = await getData();

  return (
    <main className="max-w-screen-2xl mx-auto w-full">
      <DataTable columns={columns} data={data} />
    </main>
  );
}
