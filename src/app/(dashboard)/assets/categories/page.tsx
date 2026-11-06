import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { CategoryClientView } from './CategoryClientView';

export default async function CategoriesPage() {
  const user = await requireAuth();

  const categories = await prisma.assetCategory.findMany({
    where: { companyId: user.companyId },
    include: {
      _count: { select: { assets: true } },
      assets: {
        select: { purchasePrice: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formatted = categories.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    prefix: c.prefix,
    description: c.description,
    icon: c.icon,
    assetCount: c._count.assets,
    totalValuation: c.assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0),
  }));

  return (
    <div>
      <PageHeader
        title="Kategori Aset"
        description="Kelola pengelompokan jenis aset perusahaan, prefix penomoran tag otomatis, dan valuasi total."
        breadcrumbs={[
          { label: 'Asset Management', href: '/assets' },
          { label: 'Asset Categories' },
        ]}
      />
      <CategoryClientView initialCategories={formatted} />
    </div>
  );
}
