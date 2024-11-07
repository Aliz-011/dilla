'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format, parse } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AttendanceWithUserAndProfile } from '@/types';
import { Button } from '@/components/ui/button';

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
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
