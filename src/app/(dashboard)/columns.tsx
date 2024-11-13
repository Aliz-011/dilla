'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format, parse } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Actions } from './actions';

import { AttendanceWithUserAndProfile } from '@/types';

export const columns: ColumnDef<AttendanceWithUserAndProfile>[] = [
  {
    accessorKey: 'user',
    header: 'Name',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.user.profile?.fullName ?? row.original.user.nrp}
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => <div>{format(new Date(row.original.date), 'PPP')}</div>,
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check-in',
    cell: ({ row }) => {
      return (
        <div>
          {row.original.checkInTime
            ? format(
                parse(row.original.checkInTime, 'HH:mm:ss', new Date()),
                'kk:mm'
              )
            : null}
        </div>
      );
    },
  },
  {
    accessorKey: 'checkOutTime',
    header: 'Check-out',
    cell: ({ row }) => (
      <div>
        {row.original.checkOutTime
          ? format(
              parse(row.original.checkOutTime, 'HH:mm:ss', new Date()),
              'kk:mm'
            )
          : null}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions id={row.original.id} />,
  },
];
