import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastTable } from '@/components/bast/BastTable';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default async function BastNonPensiunPage() {
  const user = await requireAuth();

  const documents = await prisma.bastDocument.findMany({
    where: { companyId: user.companyId, type: 'NON_PENSIUN' },
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="BAST Offboarding Non-Pensiun"
        description="Berita acara serah terima pengembalian aset bagi karyawan resign, berakhir kontrak, mutasi, atau terminasi lainnya."
        breadcrumbs={[
          { label: 'BAST Management', href: '/bast' },
          { label: 'BAST Non-Pensiun' },
        ]}
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-xs bg-amber-600 hover:bg-amber-700">
            <Link href="/offboarding">
              <UserX className="h-4 w-4" />
              Proses Offboard Non-Pensiun
            </Link>
          </Button>
        }
      />
      <BastTable
        initialDocuments={documents}
        fixedType="NON_PENSIUN"
        title="Daftar BAST Non-Pensiun"
      />
    </div>
  );
}
