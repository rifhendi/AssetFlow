import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  Laptop,
  CheckCircle2,
  Users,
  Wrench,
  ArrowRightLeft,
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { formatDateShort, formatDateTime, formatCurrency } from '@/lib/utils';

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
    departmentsWithCount,
    assetValuation,
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
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        asset: true,
        toEmployee: true,
        fromEmployee: true,
      },
    }),
    prisma.bastDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.assetCategory.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        icon: true,
        _count: { select: { assets: true } },
      },
      orderBy: { assets: { _count: 'desc' } },
    }),
    prisma.department.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true } },
      },
      orderBy: { assets: { _count: 'desc' } },
    }),
    prisma.asset.aggregate({
      where: { companyId },
      _sum: { purchasePrice: true },
    }),
  ]);

  const categoryData = categoriesWithCount
    .map((c) => ({ id: c.id, name: c.name, count: c._count.assets }))
    .filter((c) => c.count > 0);

  const departmentData = departmentsWithCount
    .map((d) => ({ id: d.id, name: d.name, count: d._count.assets }))
    .filter((d) => d.count > 0);

  const statusData = [
    {
      name: 'ASSIGNED',
      label: 'Aktif Digunakan',
      count: assignedAssets,
      color: '#4f46e5', // Indigo
      statusCode: 'ASSIGNED',
    },
    {
      name: 'AVAILABLE',
      label: 'Siap di Stok IT',
      count: availableAssets,
      color: '#10b981', // Emerald
      statusCode: 'AVAILABLE',
    },
    {
      name: 'MAINTENANCE',
      label: 'Servis & RMA',
      count: maintenanceAssets,
      color: '#f59e0b', // Amber
      statusCode: 'MAINTENANCE',
    },
    {
      name: 'RETIRED',
      label: 'Purna Tugas',
      count: retiredAssets,
      color: '#94a3b8', // Slate
      statusCode: 'RETIRED',
    },
  ];

  const totalValue = assetValuation._sum.purchasePrice || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Pusat Kontrol Aset IT Enterprise
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Asset<span className="text-indigo-600">Flow</span> IT Infrastructure
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Monitoring inventaris perangkat keras, laptop, workstation, switch, server, dan dokumen BAST secara terpusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="default" className="shadow-xs bg-indigo-600 hover:bg-indigo-700">
            <Link href="/transactions/checkout">
              <ArrowRightLeft className="mr-1.5 h-4 w-4" />
              Checkout Perangkat
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="shadow-xs">
            <Link href="/transactions/checkin">
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
              Return Perangkat
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="shadow-xs">
            <Link href="/bast">
              <FileText className="mr-1.5 h-4 w-4 text-purple-600" />
              Dokumen BAST
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Clickable Interactive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets Card */}
        <Link
          href="/assets"
          className="group block rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Armada IT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{totalAssets}</span>
            <span className="text-xs font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Nilai Aset:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(totalValue)}</span>
          </div>
        </Link>

        {/* Assigned Assets Card */}
        <Link
          href="/assets?status=ASSIGNED"
          className="group block rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Aktif Digunakan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{assignedAssets}</span>
            <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Detail <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Penerima:</span>
            <span className="font-semibold text-slate-700">{employeesWithAssetsCount} staf aktif</span>
          </div>
        </Link>

        {/* Available Assets in Stock */}
        <Link
          href="/assets?status=AVAILABLE"
          className="group block rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ready di Stok IT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">{availableAssets}</span>
            <span className="text-xs font-medium text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Checkout <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Buffer Stock:</span>
            <span className="font-semibold text-emerald-600">Siap deploy</span>
          </div>
        </Link>

        {/* Maintenance & RMA */}
        <Link
          href="/assets?status=MAINTENANCE"
          className="group block rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Servis & Purna Tugas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {maintenanceAssets + retiredAssets}
            </span>
            <span className="text-xs font-medium text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Kelola <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Status:</span>
            <span className="font-medium text-slate-700">
              {maintenanceAssets} servis, {retiredAssets} retired
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Interactive Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Kategori:
        </span>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
        >
          <span>Semua Perangkat IT</span>
          <span className="rounded-full bg-indigo-200/70 px-1.5 py-0.2 text-[10px] text-indigo-900">
            {totalAssets}
          </span>
        </Link>
        {categoriesWithCount.map((cat) => (
          <Link
            key={cat.id}
            href={`/assets?category=${cat.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all shadow-2xs shrink-0"
          >
            <span>{cat.name}</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-500">
              {cat._count.assets}
            </span>
          </Link>
        ))}
      </div>

      {/* 4. Interactive Charts Section */}
      <DashboardCharts
        totalAssets={totalAssets}
        categoryData={categoryData}
        departmentData={departmentData}
        statusData={statusData}
      />

      {/* 5. Recent Activity: Transactions & BAST Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Log Transaksi Perangkat IT
              </CardTitle>
              <CardDescription className="text-xs">
                Pergerakan checkout, return, dan mutasi perangkat
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
              <div className="space-y-2.5">
                {recentTransactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
                            : trx.notes || 'Operasi IT'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                      {formatDateShort(trx.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-slate-400">
                Belum ada transaksi aset IT
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Generated BAST Documents */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Arsip Dokumen BAST Terbaru
              </CardTitle>
              <CardDescription className="text-xs">
                Berita acara serah terima resmi yang telah disahkan
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
              <div className="space-y-2.5">
                {recentBastDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {doc.documentNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {doc.recipientName} ({doc.recipientDepartment || 'IT'}) • {doc._count.items} unit
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <StatusBadge type="bastType" value={doc.type} />
                      <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                        <Link href={`/bast/${doc.id}`}>Buka</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-slate-400">
                Belum ada dokumen BAST
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
