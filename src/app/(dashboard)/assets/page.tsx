import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { AssetTable } from '@/components/assets/AssetTable';

export default async function AssetsPage() {
  const user = await requireAuth();

  const [assets, categories, locations, departments] = await Promise.all([
    prisma.asset.findMany({
      where: { companyId: user.companyId },
      include: {
        category: true,
        location: true,
        department: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { employee: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assetCategory.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
    }),
    prisma.assetLocation.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
    }),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Daftar Seluruh Aset"
        description="Kelola seluruh inventaris fisik perusahaan, status ketersediaan, pemegang aset, dan nomor tag."
        breadcrumbs={[{ label: 'Asset Management' }, { label: 'All Assets' }]}
      />
      <AssetTable
        initialAssets={assets}
        categories={categories}
        locations={locations}
        departments={departments}
      />
    </div>
  );
}

