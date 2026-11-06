import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransferClientView } from './TransferClientView';

export default async function TransferPage({
  searchParams,
}: {
  searchParams: { assetId?: string };
}) {
  const user = await requireAuth();

  const [assets, employees, locations] = await Promise.all([
    prisma.asset.findMany({
      where: {
        companyId: user.companyId,
        status: { in: ['AVAILABLE', 'ASSIGNED', 'IN_USE'] },
      },
      include: {
        category: true,
        location: true,
        department: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { employee: true },
        },
      },
      orderBy: { assetTag: 'asc' },
    }),
    prisma.employee.findMany({
      where: { companyId: user.companyId, isActive: true },
      include: { department: true },
      orderBy: { fullName: 'asc' },
    }),
    prisma.assetLocation.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Transfer & Mutasi Aset"
        description="Lakukan pemindahan kepemilikan aset antar karyawan atau relokasi gedung operasional secara tercatat."
        breadcrumbs={[
          { label: 'Asset Transactions' },
          { label: 'Transfer Asset' },
        ]}
      />
      <TransferClientView
        assets={assets}
        employees={employees}
        locations={locations}
        preselectedAssetId={searchParams.assetId}
      />
    </div>
  );
}
