import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastTable } from '@/components/bast/BastTable';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default async function BastPensiunPage() {
  const user = await requireAuth();

  const documents = await prisma.bastDocument.findMany({
    where: { companyId: user.companyId, type: 'PENSIUN' },
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="BAST Karyawan Pensiun"
        description="Berita acara serah terima penyelesaian inventaris untuk karyawan yang telah memasuki purna tugas."
        breadcrumbs={[
          { label: 'BAST Management', href: '/bast' },
          { label: 'BAST Pensiun' },
        ]}
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-xs bg-purple-600 hover:bg-purple-700">
            <Link href="/offboarding">
              <UserX className="h-4 w-4" />
              Proses Pensiun / Offboard
            </Link>
          </Button>
        }
      />
      <BastTable
        initialDocuments={documents}
        fixedType="PENSIUN"
        title="Daftar BAST Karyawan Pensiun"
      />
    </div>
  );
}
