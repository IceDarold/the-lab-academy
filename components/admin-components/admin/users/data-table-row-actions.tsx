
import * as React from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Button from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { User } from './columns';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const user = row.original as User;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-gray-700"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem href={`/admin/users/${user.id}/edit`}>
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem>Change Role</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-400 hover:!bg-red-500/20 hover:!text-red-300">
          Block User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}