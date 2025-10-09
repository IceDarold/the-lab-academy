import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowUpDown, EyeOff, SortAsc, SortDesc } from 'lucide-react';
import Button from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

// FIX: Changed from interface extending React.HTMLAttributes to a type intersection.
// This resolves a TypeScript issue where `className` was not being recognized on the props object when destructured.
type DataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>;
  title: string;
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...rest
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className} {...rest}>{title}</div>;
  }

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`} {...rest}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-gray-700"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <SortDesc className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <SortAsc className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <SortAsc className="mr-2 h-3.5 w-3.5 text-gray-400/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <SortDesc className="mr-2 h-3.5 w-3.5 text-gray-400/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-gray-400/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
