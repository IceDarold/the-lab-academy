
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Badge from '../../ui/badge';
import Checkbox from '../../ui/checkbox';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student';
  registrationDate: string; // ISO string format
  status: 'Active' | 'Blocked';
};

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          // FIX: The original expression `(table.getIsSomePageRowsSelected() && 'indeterminate')` returned a string, causing a type error.
          // This is changed to return a boolean, which checks the box if some or all rows are selected.
          table.getIsSomePageRowsSelected()
        }
        // FIX: The `onChange` handler was incorrectly implemented, causing it to always toggle with `true`. It now correctly uses the event's checked state.
        onChange={(value) => table.toggleAllPageRowsSelected(!!(value.target as HTMLInputElement).checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        // FIX: The `onChange` handler was incorrectly implemented, causing it to always toggle with `true`. It now correctly uses the event's checked state.
        onChange={(value) => row.toggleSelected(!!(value.target as HTMLInputElement).checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
        const role = row.getValue('role') as User['role'];
        const variant = role === 'Admin' ? 'primary' : 'secondary';
        return <Badge variant={variant}>{role}</Badge>;
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as User['status'];
        const variant = status === 'Active' ? 'success' : 'danger';
        return <Badge variant={variant}>{status}</Badge>;
    }
  },
  {
    accessorKey: 'registrationDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration Date" />
    ),
    cell: ({ row }) => {
      return <span>{format(new Date(row.getValue('registrationDate')), 'LLL dd, yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];