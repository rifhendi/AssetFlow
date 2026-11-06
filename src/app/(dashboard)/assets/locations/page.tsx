import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { LocationClientView } from './LocationClientView';

export default async function LocationsPage() {
  const user = await requireAuth();

  const locations = await prisma.assetLocation.findMany({
    where: { companyId: user.companyId },
    include: {
      _count: { select: { assets: true, employees: true } },
    },
    orderBy: { name: 'asc' },
  });

  const formatted = locations.map((l) => ({
    id: l.id,
    code: l.code,
    name: l.name,
    building: l.building,
    floor: l.floor,
    room: l.room,
    description: l.description,
    assetCount: l._count.assets,
    employeeCount: l._count.employees,
  }));

  return (
    <div>
      <PageHeader
        title="Lokasi & Gudang Aset"
        description="Kelola persebaran lokasi fisik kantor pusat, kantor cabang, dan gudang penyimpanan inventaris."
        breadcrumbs={[
          { label: 'Asset Management', href: '/assets' },
          { label: 'Asset Locations' },
        ]}
      />
      <LocationClientView initialLocations={formatted} />
    </div>
  );
}

