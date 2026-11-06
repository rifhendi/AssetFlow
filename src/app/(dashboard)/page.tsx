import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  Box,
  CheckCircle2,
  Users,
  Wrench,
  Archive,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { formatDateShort, formatDateTime } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await requireAuth();
  const companyId = user.companyId;

  // Real Database Queries in parallel
  const [
    totalAssets,
    availableAssets,
    assignedAssets,
    maintenanceAssets,
    retiredAssets,
    totalEmployees,
    employeesWithAssetsCount,
    recentTransactions,
    recentBastDocuments,
    categoriesWithCount,
    locationsWithCount,
    departmentsWithCount,
  ] = await Promise.all([
    prisma.asset.count({ where: { companyId } }),
    prisma.asset.count({ where: { companyId, status: 'AVAILABLE' } }),
    prisma.asset.count({
      where: { companyId, status: { in: ['ASSIGNED', 'IN_USE'] } },
    }),
    prisma.asset.count({ where: { companyId, status: 'MAINTENANCE' } }),
    prisma.asset.count({
      where: { companyId, status: { in: ['RETIRED', 'DISPOSED'] } },
    }),
    prisma.employee.count({ where: { companyId, isActive: true } }),
    prisma.employee.count({
      where: {
        companyId,
        isActive: true,
        assignments: { some: { status: 'ACTIVE' } },
      },
    }),
    prisma.assetTransaction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        asset: true,
        toEmployee: true,
        fromEmployee: true,
      },
    }),
    prisma.bastDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.assetCategory.findMany({
      where: { companyId },
      select: {
        name: true,
        _count: { select: { assets: true } },
      },
    }),
    prisma.assetLocation.findMany({
      where: { companyId },
      select: {
        name: true,
        _count: { select: { assets: true } },
      },
    }),
    prisma.department.findMany({
      where: { companyId },
      select: {
        name: true,
        _count: { select: { assets: true } },
      },
    }),
  ]);

  const categoryData = categoriesWithCount
    .map((c) => ({ name: c.name, count: c._count.assets }))
    .filter((c) => c.count > 0);

  const locationData = locationsWithCount
    .map((l) => ({ name: l.name.replace('Kantor ', ''), count: l._count.assets }))
    .filter((l) => l.count > 0);

  const departmentData = departmentsWithCount
    .map((d) => ({ name: d.name.split(' ')[0], count: d._count.assets }))
    .filter((d) => d.count > 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Overview Sistem Enterprise
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Selamat Datang di AssetFlow
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Pantau ketersediaan perangkat, mutasi aset karyawan, dan dokumen BAST
            perusahaan secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="default" className="shadow-xs">
            <Link href="/transactions/checkout">
              <ArrowRightLeft className="mr-1.5 h-4 w-4" />
              Checkout Aset
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="shadow-xs">
            <Link href="/transactions/checkin">
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
              Return Aset
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="shadow-xs">
            <Link href="/bast">
              <FileText className="mr-1.5 h-4 w-4 text-purple-600" />
              Kelola BAST
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Total Seluruh Aset
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Box className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalAssets}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{availableAssets} unit</span>{' '}
              tersedia untuk checkout
            </p>
          </CardContent>
        </Card>

        {/* Assigned Assets */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Aset Digunakan Karyawan
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{assignedAssets}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pegang hak guna aktif oleh karyawan
            </p>
          </CardContent>
        </Card>

        {/* Total Employees with Assets */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Karyawan Aktif
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEmployees}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {employeesWithAssetsCount} karyawan memegang inventaris
            </p>
          </CardContent>
        </Card>

        {/* Assets Under Maintenance */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Servis & Purna Aset
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {maintenanceAssets + retiredAssets}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="text-amber-600 font-medium">{maintenanceAssets} servis</span>,{' '}
              {retiredAssets} pensiun/disposed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Analisis Distribusi Aset
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi persebaran aset menurut kategori, lokasi gedung, dan divisi
            </p>
          </div>
        </div>
        <DashboardCharts
          categoryData={categoryData}
          locationData={locationData}
          departmentData={departmentData}
        />
      </div>

      {/* Recent Activity: Transactions & BAST Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Aktivitas Transaksi Terkini
              </CardTitle>
              <CardDescription className="text-xs">
                Log pergerakan checkout, return, dan mutasi aset
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/transactions/history">
                Lihat Semua <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge type="transactionType" value={trx.type} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {trx.asset.name}{' '}
                          <span className="text-slate-400 font-normal">
                            ({trx.asset.assetTag})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {trx.toEmployee
                            ? `Penerima: ${trx.toEmployee.fullName}`
                            : trx.fromEmployee
                            ? `Pengembali: ${trx.fromEmployee.fullName}`
                            : trx.notes || 'Operasi sistem'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-3">
                      {formatDateShort(trx.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi aset yang tercatat
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Generated BAST Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Dokumen BAST Terakhir
              </CardTitle>
              <CardDescription className="text-xs">
                Berita acara serah terima yang telah diterbitkan
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/bast">
                Lihat Semua <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBastDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentBastDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge type="bastType" value={doc.type} />
                      <div className="min-w-0">
                        <Link
                          href={`/bast/${doc.id}`}
                          className="font-mono font-semibold text-indigo-600 hover:underline block truncate"
                        >
                          {doc.documentNumber}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          Penerima: {doc.recipientName} ({doc._count.items} aset)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] text-slate-400">
                        {formatDateShort(doc.date)}
                      </span>
                      <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                        <Link href={`/bast/${doc.id}`}>Cetak / Preview</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada dokumen BAST yang diterbitkan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
