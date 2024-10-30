'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table-column-header';

export type Attendence = {
  id: string;
  employee: string;
  date: Date;
  checkIn: number;
  checkOut: number;
};

export const columns: ColumnDef<Attendence>[] = [
  {
    accessorKey: 'employee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'checkIn',
    header: 'Check-in',
  },
  {
    accessorKey: 'checkOut',
    header: 'Check-out',
  },
];
