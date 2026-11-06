import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { ReportsView } from './ReportsView';

export default async function ReportsPage() {
  const user = await requireAuth();

  const [
    totalAssetCount,
    totalValuation,
    assignedCount,
    availableCount,
    maintenanceCount,
    retiredCount,
    employeesWithAssets,
    recentTransactions,
  ] = await Promise.all([
    prisma.asset.count({ where: { companyId: user.companyId } }),
    prisma.asset.aggregate({
      where: { companyId: user.companyId },
      _sum: { purchasePrice: true },
    }),
    prisma.asset.count({
      where: { companyId: user.companyId, status: { in: ['ASSIGNED', 'IN_USE'] } },
    }),
    prisma.asset.count({ where: { companyId: user.companyId, status: 'AVAILABLE' } }),
    prisma.asset.count({ where: { companyId: user.companyId, status: 'MAINTENANCE' } }),
    prisma.asset.count({
      where: { companyId: user.companyId, status: { in: ['RETIRED', 'DISPOSED'] } },
    }),
    prisma.employee.findMany({
      where: {
        companyId: user.companyId,
        isActive: true,
        assignments: { some: { status: 'ACTIVE' } },
      },
      include: {
        department: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { asset: true },
        },
      },
    }),
    prisma.assetTransaction.findMany({
      where: { companyId: user.companyId },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        asset: true,
        toEmployee: true,
        fromEmployee: true,
        bastDocument: true,
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Pusat Laporan & Analitik Aset"
        description="Unduh rekapitulasi data inventaris, laporan pertanggungjawaban karyawan, log mutasi, dan purna aset dalam format Excel & PDF."
        breadcrumbs={[{ label: 'Reports & Analytics' }]}
      />
      <ReportsView
        summary={{
          totalAssets: totalAssetCount,
          totalValuation: totalValuation._sum.purchasePrice || 0,
          assigned: assignedCount,
          available: availableCount,
          maintenance: maintenanceCount,
          retired: retiredCount,
        }}
        employeesWithAssets={employeesWithAssets}
        recentTransactions={recentTransactions}
      />
    </div>
  );
}
