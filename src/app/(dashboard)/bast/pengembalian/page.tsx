import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastTable } from '@/components/bast/BastTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function BastPengembalianPage() {
  const user = await requireAuth();

  const documents = await prisma.bastDocument.findMany({
    where: { companyId: user.companyId, type: 'PENGEMBALIAN' },
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="BAST Pengembalian Aset"
        description="Dokumen bukti pengembalian inventaris dari karyawan ke gudang aset perusahaan."
        breadcrumbs={[
          { label: 'BAST Management', href: '/bast' },
          { label: 'BAST Pengembalian' },
        ]}
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700">
            <Link href="/transactions/checkin">
              <Plus className="h-4 w-4" />
              Return & Buat BAST Pengembalian
            </Link>
          </Button>
        }
      />
      <BastTable
        initialDocuments={documents}
        fixedType="PENGEMBALIAN"
        title="Daftar BAST Pengembalian"
      />
    </div>
  );
}
