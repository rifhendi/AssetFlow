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
import { QrCodeModal } from './QrCodeModal';
import { AssetFormModal } from './AssetFormModal';
import { ExcelImportModal } from './ExcelImportModal';
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
  QrCode,
  ArrowUpDown,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { toast } from 'sonner';

interface AssetTableProps {
  initialAssets: any[];
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function AssetTable({
  initialAssets,
  categories,
  locations,
  departments,
}: AssetTableProps) {
  const [data, setData] = useState(initialAssets);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [qrAsset, setQrAsset] = useState<any | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const fresh = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteAsset) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/assets/${deleteAsset.id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menghapus aset');
      }
      toast.success(`Aset ${deleteAsset.assetTag} berhasil dihapus`);
      setDeleteAsset(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (categoryFilter && item.categoryId !== categoryFilter) return false;
      if (locationFilter && item.locationId !== locationFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (departmentFilter && item.departmentId !== departmentFilter) return false;
      if (globalFilter) {
        const query = globalFilter.toLowerCase();
        const tag = (item.assetTag || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        const sn = (item.serialNumber || '').toLowerCase();
        const user = (item.assignments?.[0]?.employee?.fullName || '').toLowerCase();
        if (
          !tag.includes(query) &&
          !name.includes(query) &&
          !brand.includes(query) &&
          !sn.includes(query) &&
          !user.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    data,
    globalFilter,
    categoryFilter,
    locationFilter,
    statusFilter,
    departmentFilter,
  ]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'assetTag',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Asset Tag
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-bold text-xs text-indigo-600">
            <Link
              href={`/assets/${row.original.id}`}
              className="hover:underline"
            >
              {row.original.assetTag}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Aset & Spesifikasi
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900 text-xs">
              {row.original.name}
            </div>
            <div className="text-[11px] text-slate-400">
              {row.original.brand ? `${row.original.brand} • ` : ''}
              {row.original.model || '-'}
              {row.original.serialNumber && ` (SN: ${row.original.serialNumber})`}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category.name',
        header: 'Kategori',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {row.original.category?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="assetStatus" value={row.original.status} />
        ),
      },
      {
        accessorKey: 'condition',
        header: 'Kondisi',
        cell: ({ row }) => (
          <StatusBadge type="assetCondition" value={row.original.condition} />
        ),
      },
      {
        id: 'assignedTo',
        header: 'Pengguna / Pemegang',
        cell: ({ row }) => {
          const activeAssignment = row.original.assignments?.[0];
          if (!activeAssignment) {
            return <span className="text-xs text-slate-400 italic">Tersedia</span>;
          }
          return (
            <div>
              <Link
                href={`/employees/${activeAssignment.employee.id}`}
                className="text-xs font-semibold text-slate-800 hover:text-indigo-600 block"
              >
                {activeAssignment.employee.fullName}
              </Link>
              <span className="text-[10px] text-slate-400">
                {activeAssignment.employee.position}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'location.name',
        header: 'Lokasi',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {row.original.location?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Harga Pembelian',
        cell: ({ row }) => (
          <span className="text-xs text-slate-700 font-medium">
            {formatCurrency(row.original.purchasePrice)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const asset = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span>Detail Aset</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAsset(asset);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4 text-indigo-500" />
                  <span>Edit Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setQrAsset(asset);
                    setIsQrOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4 text-slate-500" />
                  <span>QR Code Label</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {asset.status === 'AVAILABLE' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/transactions/checkout?assetId=${asset.id}`}
                      className="flex items-center gap-2 text-indigo-600"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Checkout Aset</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {asset.status === 'ASSIGNED' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/transactions/checkin?assetId=${asset.id}`}
                      className="flex items-center gap-2 text-emerald-600"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Kembalikan Aset</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteAsset(asset)}
                  className="flex items-center gap-2 text-rose-600 focus:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Aset</span>
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
      {/* Header Controls: Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari aset, tag, SN, brand, pemegang..."
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
              <a href="/api/assets/export" download>
                <Download className="h-4 w-4 text-blue-600" />
                <span>Ekspor Excel</span>
              </a>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedAsset(null);
                setIsFormOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Aset</span>
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="AVAILABLE">Tersedia (Available)</option>
            <option value="ASSIGNED">Dipinjamkan (Assigned)</option>
            <option value="IN_USE">Sedang Digunakan</option>
            <option value="MAINTENANCE">Dalam Pemeliharaan</option>
            <option value="RETURNED">Dikembalikan</option>
            <option value="RETIRED">Purna Aset (Retired)</option>
            <option value="LOST">Hilang (Lost)</option>
            <option value="DISPOSED">Dihapuskan (Disposed)</option>
          </Select>

          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>

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
        </div>
      </div>

      {/* TanStack Table Card */}
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

            {/* Pagination Controls */}
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
                aset
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
              title="Tidak ada data aset ditemukan"
              description="Coba ubah kata kunci pencarian atau reset filter untuk menampilkan data aset."
              actionLabel="Tambah Aset Baru"
              onAction={() => {
                setSelectedAsset(null);
                setIsFormOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      <AssetFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={refreshData}
        asset={selectedAsset}
        categories={categories}
        locations={locations}
        departments={departments}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        open={isQrOpen}
        onOpenChange={setIsQrOpen}
        asset={qrAsset}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={refreshData}
        endpoint="/api/assets/import"
        title="Impor Aset dari Excel"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAsset}
        onOpenChange={(open) => !open && setDeleteAsset(null)}
        title={`Hapus Aset ${deleteAsset?.assetTag}?`}
        description="Aset akan dihapus permanen dari basis data sistem. Riwayat transaksi sebelumnya tidak dapat dikembalikan."
        confirmLabel="Hapus Sekarang"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

