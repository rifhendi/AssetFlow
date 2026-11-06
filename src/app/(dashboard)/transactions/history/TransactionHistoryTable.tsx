'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
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
import { Search, ArrowUpDown, FileText, ArrowRightLeft } from 'lucide-react';
import { formatDateShort, formatDateTime } from '@/lib/utils';

export function TransactionHistoryTable({
  initialTransactions,
}: {
  initialTransactions: any[];
}) {
  const [data] = useState(initialTransactions);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const trx = (item.transactionNumber || '').toLowerCase();
        const assetName = (item.asset.name || '').toLowerCase();
        const tag = (item.asset.assetTag || '').toLowerCase();
        const toEmp = (item.toEmployee?.fullName || '').toLowerCase();
        const fromEmp = (item.fromEmployee?.fullName || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        if (
          !trx.includes(q) &&
          !assetName.includes(q) &&
          !tag.includes(q) &&
          !toEmp.includes(q) &&
          !fromEmp.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [data, globalFilter, typeFilter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: 'Nomor Transaksi',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-slate-800">
            {row.original.transactionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipe Transaksi',
        cell: ({ row }) => (
          <StatusBadge type="transactionType" value={row.original.type} />
        ),
      },
      {
        accessorKey: 'asset.name',
        header: 'Aset',
        cell: ({ row }) => (
          <div>
            <Link
              href={`/assets/${row.original.asset.id}`}
              className="font-bold text-xs text-indigo-600 hover:underline"
            >
              [{row.original.asset.assetTag}] {row.original.asset.name}
            </Link>
            <div className="text-[11px] text-slate-400">
              {row.original.asset.category.name}
            </div>
          </div>
        ),
      },
      {
        id: 'party',
        header: 'Pihak Terkait',
        cell: ({ row }) => {
          const t = row.original;
          if (t.toEmployee) {
            return (
              <span className="text-xs text-slate-800">
                Penerima:{' '}
                <Link
                  href={`/employees/${t.toEmployee.id}`}
                  className="font-semibold hover:text-indigo-600"
                >
                  {t.toEmployee.fullName}
                </Link>
              </span>
            );
          }
          if (t.fromEmployee) {
            return (
              <span className="text-xs text-slate-800">
                Pengembali:{' '}
                <Link
                  href={`/employees/${t.fromEmployee.id}`}
                  className="font-semibold hover:text-indigo-600"
                >
                  {t.fromEmployee.fullName}
                </Link>
              </span>
            );
          }
          if (t.toLocation) {
            return (
              <span className="text-xs text-slate-700">
                Relokasi ke: {t.toLocation.name}
              </span>
            );
          }
          return <span className="text-xs text-slate-400">-</span>;
        },
      },
      {
        accessorKey: 'condition',
        header: 'Kondisi',
        cell: ({ row }) => (
          <StatusBadge type="assetCondition" value={row.original.condition} />
        ),
      },
      {
        accessorKey: 'date',
        header: 'Tanggal & Waktu',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatDateTime(row.original.date)}
          </span>
        ),
      },
      {
        id: 'bast',
        header: 'Dokumen BAST',
        cell: ({ row }) => {
          const doc = row.original.bastDocument;
          if (!doc) return <span className="text-xs text-slate-400">-</span>;
          return (
            <Link
              href={`/bast/${doc.id}`}
              className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{doc.documentNumber}</span>
            </Link>
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
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nomor TRX, nama aset, tag, staf..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-60">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="">Semua Tipe Transaksi</option>
            <option value="CHECKOUT">Checkout (Penyerahan)</option>
            <option value="CHECKIN">Checkin (Pengembalian)</option>
            <option value="TRANSFER">Transfer (Mutasi)</option>
            <option value="MAINTENANCE_IN">Masuk Servis</option>
            <option value="MAINTENANCE_OUT">Selesai Servis</option>
            <option value="RETIREMENT">Purna Aset</option>
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
                        {flexRender(
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

            <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
              <div>
                Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
                {table.getPageCount() || 1} ({filteredData.length} transaksi)
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
              title="Tidak ada transaksi yang cocok"
              description="Coba ubah kata kunci atau pilih filter tipe transaksi yang berbeda."
            />
          </div>
        )}
      </div>
    </div>
  );
}
