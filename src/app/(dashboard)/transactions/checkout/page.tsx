import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { CheckoutWizard } from './CheckoutWizard';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { employeeId?: string; assetId?: string };
}) {
  const user = await requireAuth();

  const [employees, availableAssets] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: user.companyId, isActive: true },
      include: {
        department: true,
        assignments: { where: { status: 'ACTIVE' } },
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.asset.findMany({
      where: { companyId: user.companyId, status: 'AVAILABLE' },
      include: {
        category: true,
        location: true,
      },
      orderBy: { assetTag: 'asc' },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Asset Checkout (Penyerahan Aset)"
        description="Serahkan perangkat kerja kepada karyawan dan terbitkan Berita Acara Serah Terima (BAST) otomatis."
        breadcrumbs={[
          { label: 'Asset Transactions' },
          { label: 'Asset Checkout' },
        ]}
      />
      <CheckoutWizard
        employees={employees}
        availableAssets={availableAssets}
        preselectedEmployeeId={searchParams.employeeId}
        preselectedAssetId={searchParams.assetId}
        currentUserName={user.name}
      />
    </div>
  );
}

