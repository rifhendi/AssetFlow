'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  FileSpreadsheet,
  Download,
  Box,
  Coins,
  Users,
  ArrowRightLeft,
  Wrench,
  Archive,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';

interface ReportsViewProps {
  summary: {
    totalAssets: number;
    totalValuation: number;
    assigned: number;
    available: number;
    maintenance: number;
    retired: number;
  };
  employeesWithAssets: any[];
  recentTransactions: any[];
}

export function ReportsView({
  summary,
  employeesWithAssets,
  recentTransactions,
}: ReportsViewProps) {
  return (
    <div className="space-y-6">
      {/* Valuation & Top KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-400 block">
            Total Nilai Buku Inventaris
          </span>
          <span className="text-xl font-bold text-indigo-700 block mt-1">
            {formatCurrency(summary.totalValuation)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Dari {summary.totalAssets} total unit terdaftar
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-400 block">
            Aset Digunakan (Assigned)
          </span>
          <span className="text-xl font-bold text-blue-700 block mt-1">
            {summary.assigned} unit
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {employeesWithAssets.length} karyawan aktif
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-400 block">
            Aset Tersedia (Stock)
          </span>
          <span className="text-xl font-bold text-emerald-700 block mt-1">
            {summary.available} unit
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Siap untuk penyerahan baru
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-400 block">
            Purna Aset & Servis
          </span>
          <span className="text-xl font-bold text-slate-700 block mt-1">
            {summary.retired + summary.maintenance} unit
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {summary.maintenance} servis • {summary.retired} pensiun
          </span>
        </Card>
      </div>

      {/* Tabs of Reports */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="inventory">Laporan Inventaris</TabsTrigger>
          <TabsTrigger value="employees">Aset Karyawan</TabsTrigger>
          <TabsTrigger value="movement">Mutasi & Transaksi</TabsTrigger>
          <TabsTrigger value="retirement">Purna Aset (Retirement)</TabsTrigger>
        </TabsList>

        {/* 1. Inventory Report */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Laporan Inventaris Seluruh Aset Perusahaan
                </CardTitle>
                <CardDescription className="text-xs">
                  Rekapitulasi lengkap seluruh aset fisik, serial number, harga perolehan, dan lokasi.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-1.5 shadow-2xs">
                <a href="/api/reports/export?type=inventory" download>
                  <Download className="h-4 w-4" />
                  Unduh Excel (.xlsx)
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center space-y-3">
                <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">
                  Data Inventaris Siap Diekspor
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Laporan mencakup data terperinci nama perangkat, kategori, brand, tipe,
                  serial number, nomor tag, lokasi kerja, divisi penanggung jawab, harga
                  pembelian, dan pemegang saat ini.
                </p>
                <Button asChild size="sm" variant="default" className="mt-2">
                  <a href="/api/reports/export?type=inventory" download>
                    Download Excel Sekarang
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Employee Assets Report */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Laporan Kepemilikan Aset per Karyawan
                </CardTitle>
                <CardDescription className="text-xs">
                  Daftar seluruh pegawai yang memegang inventaris aktif beserta rincian perangkatnya.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-1.5 shadow-2xs">
                <a href="/api/reports/export?type=employees" download>
                  <Download className="h-4 w-4" />
                  Unduh Excel (.xlsx)
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {employeesWithAssets.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white text-xs gap-3 shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {emp.fullName} ({emp.nik})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {emp.position} • {emp.department.name}
                      </span>
                      <div className="text-[11px] text-indigo-600 font-medium mt-1">
                        Aset dipegang:{' '}
                        {emp.assignments.map((a: any) => a.asset.name).join(', ')}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 shrink-0 self-start sm:self-auto">
                      {emp.assignments.length} unit aset
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Movement Report */}
        <TabsContent value="movement" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Laporan Mutasi & Perpindahan Aset
                </CardTitle>
                <CardDescription className="text-xs">
                  Log pergerakan serah terima checkout, return, mutasi lokasi, dan perbaikan.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-1.5 shadow-2xs">
                <a href="/api/reports/export?type=movement" download>
                  <Download className="h-4 w-4" />
                  Unduh Excel (.xlsx)
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.slice(0, 10).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge type="transactionType" value={t.type} />
                      <div>
                        <span className="font-bold text-slate-900">
                          [{t.asset.assetTag}] {t.asset.name}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {t.toEmployee
                            ? `Penerima: ${t.toEmployee.fullName}`
                            : t.fromEmployee
                            ? `Pengembali: ${t.fromEmployee.fullName}`
                            : t.notes}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {formatDateShort(t.date)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Retirement Report */}
        <TabsContent value="retirement" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Laporan Purna Aset & Pemusnahan (Disposal)
                </CardTitle>
                <CardDescription className="text-xs">
                  Daftar inventaris yang telah habis masa manfaat ekonomis atau dihapuskan dari pembukuan.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-1.5 shadow-2xs">
                <a href="/api/reports/export?type=retirement" download>
                  <Download className="h-4 w-4" />
                  Unduh Excel (.xlsx)
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center space-y-3">
                <Archive className="h-10 w-10 text-slate-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">
                  Laporan Purna Tugas Aset (Disposal Log)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Berisi rincian aset berstatus RETIRED dan DISPOSED, riwayat kerusakan, dan
                  catatan penghapusan untuk keperluan audit akuntansi dan aset tetap.
                </p>
                <Button asChild size="sm" variant="default" className="mt-2">
                  <a href="/api/reports/export?type=retirement" download>
                    Download Laporan Purna Aset (.xlsx)
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
