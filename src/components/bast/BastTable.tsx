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
import { Search, Printer, Eye, FileText, ArrowUpDown, Plus } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface BastTableProps {
  initialDocuments: any[];
  fixedType?: string;
  title?: string;
}

export function BastTable({
  initialDocuments,
  fixedType,
  title = 'Semua Dokumen BAST',
}: BastTableProps) {
  const [data] = useState(initialDocuments);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(fixedType || '');
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const docNum = (item.documentNumber || '').toLowerCase();
        const recipient = (item.recipientName || '').toLowerCase();
        const issuer = (item.issuerName || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        if (
          !docNum.includes(q) &&
          !recipient.includes(q) &&
          !issuer.includes(q) &&
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
        accessorKey: 'documentNumber',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nomor BAST
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/bast/${row.original.id}`}
            className="font-mono font-bold text-xs text-indigo-600 hover:underline flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>{row.original.documentNumber}</span>
          </Link>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Jenis Dokumen',
        cell: ({ row }) => <StatusBadge type="bastType" value={row.original.type} />,
      },
      {
        accessorKey: 'recipientName',
        header: 'Pihak Kedua (Penerima)',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-xs text-slate-800">
              {row.original.recipientName}
            </div>
            <div className="text-[11px] text-slate-400">
              {row.original.recipientNik ? `NIK: ${row.original.recipientNik} • ` : ''}
              {row.original.recipientPosition || '-'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'issuerName',
        header: 'Pihak Pertama (Penyerah)',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-xs text-slate-800">
              {row.original.issuerName}
            </div>
            <div className="text-[11px] text-slate-400">
              {row.original.issuerPosition}
            </div>
          </div>
        ),
      },
      {
        id: 'itemCount',
        header: 'Jumlah Aset',
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-slate-700">
            {row.original._count?.items || row.original.items?.length || 0} Aset
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Tanggal Terbit',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatDateShort(row.original.date)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 shadow-2xs"
            >
              <Link href={`/bast/${row.original.id}`}>
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>Lihat</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-2xs"
            >
              <Link href={`/bast/${row.original.id}`}>
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak</span>
              </Link>
            </Button>
          </div>
        ),
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
    initialState: { pagination: { pageSize: 12 } },
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nomor BAST, nama staf, pihak penerima..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {!fixedType && (
          <div className="w-full sm:w-64">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="">Semua Jenis BAST</option>
              <option value="PENYERAHAN">BAST Penyerahan Aset</option>
              <option value="PENGEMBALIAN">BAST Pengembalian Aset</option>
              <option value="PENSIUN">BAST Karyawan Pensiun</option>
              <option value="NON_PENSIUN">BAST Offboarding Non-Pensiun</option>
            </Select>
          </div>
        )}
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
                {table.getPageCount() || 1} ({filteredData.length} dokumen)
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
              title="Tidak ada dokumen BAST ditemukan"
              description="Belum ada berita acara yang diterbitkan sesuai filter ini."
            />
          </div>
        )}
      </div>
    </div>
  );
}

