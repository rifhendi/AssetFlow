import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { CheckinWizard } from './CheckinWizard';

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: { employeeId?: string; assetId?: string };
}) {
  const user = await requireAuth();

  // Find employees who currently have active assignments
  const employeesWithAssets = await prisma.employee.findMany({
    where: {
      companyId: user.companyId,
      assignments: { some: { status: 'ACTIVE' } },
    },
    include: {
      department: true,
      assignments: {
        where: { status: 'ACTIVE' },
        include: {
          asset: {
            include: { category: true, location: true },
          },
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  return (
    <div>
      <PageHeader
        title="Asset Check-in (Pengembalian Aset)"
        description="Terima kembali aset inventaris dari karyawan, periksa kondisi fisik, dan terbitkan BAST Pengembalian otomatis."
        breadcrumbs={[
          { label: 'Asset Transactions' },
          { label: 'Asset Check-in' },
        ]}
      />
      <CheckinWizard
        employees={employeesWithAssets}
        preselectedEmployeeId={searchParams.employeeId}
        preselectedAssetId={searchParams.assetId}
        currentUserName={user.name}
      />
    </div>
  );
}

