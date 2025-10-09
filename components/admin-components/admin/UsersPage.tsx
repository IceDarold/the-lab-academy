
import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

import { columns, User } from './users/columns';
import { UsersDataTable } from './UsersDataTable';
import Input from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus } from 'lucide-react';
import UserProfilePanel from './users/UserProfilePanel';

// Mock data generation
const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user${i + 1}`,
  name: `User Name ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 4 === 0 ? 'Admin' : 'Student',
  registrationDate: new Date(2023, Math.floor(i/2), (i % 28) + 1).toISOString(),
  status: i % 5 === 0 ? 'Blocked' : 'Active',
}));

const UsersPage: React.FC = () => {
  console.log('[UsersPage] Component initialized.');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const table = useReactTable({
    data: mockUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  
  const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      console.log(`[UsersPage] Filtering by name/email: "${value}"`);
      table.getColumn('name')?.setFilterValue(value);
  };

  const handleRoleFilterChange = (value: string) => {
      const filterValue = value === 'all' ? undefined : value;
      console.log(`[UsersPage] Filtering by role: "${filterValue}"`);
      table.getColumn('role')?.setFilterValue(filterValue);
  };

  const handleSelectUser = (user: User) => {
    console.log(`[UsersPage] Selecting user for profile view: id=${user.id}`);
    setSelectedUser(user);
  };

  const handleClosePanel = () => {
    console.log('[UsersPage] Closing user profile panel.');
    setSelectedUser(null);
  };

  return (
    <div className="w-full p-6 md:p-8 flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-gray-400">Manage all users in the system.</p>
          </div>
          <a
            href="/admin/users/new"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-blue-600 text-gray-50 hover:bg-blue-600/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New User
          </a>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <Input
            placeholder="Filter by name or email..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={handleNameFilterChange}
            className="max-w-sm"
          />
          <div className="w-48">
            <Select onValueChange={handleRoleFilterChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <UsersDataTable columns={columns} data={mockUsers} table={table} onRowClick={handleSelectUser} />
      </div>

      <UserProfilePanel user={selectedUser} onOpenChange={(open) => !open && handleClosePanel()} />
    </div>
  );
};

export default UsersPage;
