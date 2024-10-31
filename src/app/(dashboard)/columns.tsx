'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';

export type Attendence = {
  id: string;
  employee: string;
  date: Date;
  checkIn?: number;
  checkOut?: number;
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
    cell: ({ row }) => <div>{format(new Date(row.original.date), 'PPP')}</div>,
  },
  {
    accessorKey: 'checkIn',
    header: 'Check-in',
    cell: ({ row }) => (
      <div>
        {row.original.checkIn
          ? format(new Date(row.original.checkIn), 'kk:mm')
          : ''}
      </div>
    ),
  },
  {
    accessorKey: 'checkOut',
    header: 'Check-out',
    cell: ({ row }) => (
      <div>
        {row.original.checkOut
          ? format(new Date(row.original.checkOut), 'kk:mm')
          : ''}
      </div>
    ),
  },
];
