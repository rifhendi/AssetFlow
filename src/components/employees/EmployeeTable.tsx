'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmployeeFormModal } from './EmployeeFormModal';
import { ExcelImportModal } from '@/components/assets/ExcelImportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowRightLeft,
  UserX,
  Box,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { toast } from 'sonner';

interface EmployeeTableProps {
  initialEmployees: any[];
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}

export function EmployeeTable({
  initialEmployees,
  departments,
  locations,
}: EmployeeTableProps) {
  const [data, setData] = useState(initialEmployees);
  const [globalFilter, setGlobalFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const fresh = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivate = async () => {
    if (!deleteEmployee) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/employees/${deleteEmployee.id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menonaktifkan karyawan');
      }
      toast.success(`Karyawan ${deleteEmployee.fullName} berhasil dinonaktifkan`);
      setDeleteEmployee(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (departmentFilter && item.departmentId !== departmentFilter) return false;
      if (statusFilter && item.employmentStatus !== statusFilter) return false;
      if (locationFilter && item.locationId !== locationFilter) return false;
      if (globalFilter) {
        const query = globalFilter.toLowerCase();
        const nik = (item.nik || '').toLowerCase();
        const name = (item.fullName || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const pos = (item.position || '').toLowerCase();
        if (
          !nik.includes(query) &&
          !name.includes(query) &&
          !email.includes(query) &&
          !pos.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [data, globalFilter, departmentFilter, statusFilter, locationFilter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'nik',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            NIK
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-bold text-xs text-indigo-600">
            <Link
              href={`/employees/${row.original.id}`}
              className="hover:underline"
            >
              {row.original.nik}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'fullName',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Karyawan & Kontak
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <Link
              href={`/employees/${row.original.id}`}
              className="font-medium text-slate-900 text-xs hover:text-indigo-600"
            >
              {row.original.fullName}
            </Link>
            <div className="text-[11px] text-slate-400">
              {row.original.email}
              {row.original.phone && ` • ${row.original.phone}`}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'department.name',
        header: 'Departemen & Jabatan',
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              {row.original.department?.name || '-'}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.original.position}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'employmentStatus',
        header: 'Status Kerja',
        cell: ({ row }) => (
          <StatusBadge
            type="employmentStatus"
            value={row.original.employmentStatus}
          />
        ),
      },
      {
        id: 'assignedAssetsCount',
        header: 'Aset Aktif',
        cell: ({ row }) => {
          const count = row.original.assignments?.length || 0;
          return (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-xs font-bold ${
                  count > 0
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
              <span className="text-[11px] text-slate-500">unit</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'location.name',
        header: 'Lokasi Kerja',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {row.original.location?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'joinDate',
        header: 'Tgl Bergabung',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatDateShort(row.original.joinDate)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Aksi Karyawan</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/employees/${emp.id}`}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span>Lihat Profil Detail</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4 text-indigo-500" />
                  <span>Edit Data Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/transactions/checkout?employeeId=${emp.id}`}
                    className="flex items-center gap-2 text-indigo-600"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Checkout Aset Baru</span>
                  </Link>
                </DropdownMenuItem>
                {emp.assignments?.length > 0 && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/transactions/checkin?employeeId=${emp.id}`}
                      className="flex items-center gap-2 text-emerald-600"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Kembalikan Aset</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/offboarding?employeeId=${emp.id}`}
                    className="flex items-center gap-2 text-amber-600"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Proses Offboarding</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteEmployee(emp)}
                  className="flex items-center gap-2 text-rose-600 focus:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Nonaktifkan Karyawan</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama, NIK, email, jabatan..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Impor Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs"
            >
              <a href="/api/employees/export" download>
                <Download className="h-4 w-4 text-blue-600" />
                <span>Ekspor Excel</span>
              </a>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedEmployee(null);
                setIsFormOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Karyawan</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Status Kerja</option>
            <option value="PERMANENT">Karyawan Tetap (Permanent)</option>
            <option value="CONTRACT">Kontrak (Contract)</option>
            <option value="PROBATION">Probation</option>
            <option value="INTERN">Magang (Intern)</option>
            <option value="RESIGNED">Resigned</option>
            <option value="RETIRED">Pensiun</option>
          </Select>

          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Lokasi Kerja</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {filteredData.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <span className="font-semibold text-slate-700">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>{' '}
                sampai{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    filteredData.length
                  )}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-slate-700">
                  {filteredData.length}
                </span>{' '}
                karyawan
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 text-xs"
                >
                  Sebelumnya
                </Button>
                <div className="font-medium text-slate-700">
                  Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
                  {table.getPageCount() || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 text-xs"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Tidak ada data karyawan ditemukan"
              description="Coba ubah kata kunci pencarian atau reset filter untuk menampilkan data karyawan."
              actionLabel="Tambah Karyawan Baru"
              onAction={() => {
                setSelectedEmployee(null);
                setIsFormOpen(true);
              }}
            />
          </div>
        )}
      </div>

      <EmployeeFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={refreshData}
        employee={selectedEmployee}
        departments={departments}
        locations={locations}
      />

      <ExcelImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={refreshData}
        endpoint="/api/employees/import"
        title="Impor Karyawan dari Excel"
      />

      <ConfirmDialog
        open={!!deleteEmployee}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        title={`Nonaktifkan Karyawan ${deleteEmployee?.fullName}?`}
        description="Status karyawan akan diubah menjadi nonaktif. Riwayat inventaris sebelumnya tetap tersimpan di dalam sistem."
        confirmLabel="Nonaktifkan"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}

