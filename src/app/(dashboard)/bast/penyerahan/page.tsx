import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastTable } from '@/components/bast/BastTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function BastPenyerahanPage() {
  const user = await requireAuth();

  const documents = await prisma.bastDocument.findMany({
    where: { companyId: user.companyId, type: 'PENYERAHAN' },
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="BAST Penyerahan Aset"
        description="Dokumen bukti penyerahan fasilitas aset perusahaan kepada karyawan."
        breadcrumbs={[
          { label: 'BAST Management', href: '/bast' },
          { label: 'BAST Penyerahan' },
        ]}
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-xs">
            <Link href="/transactions/checkout">
              <Plus className="h-4 w-4" />
              Checkout & Buat BAST Baru
            </Link>
          </Button>
        }
      />
      <BastTable
        initialDocuments={documents}
        fixedType="PENYERAHAN"
        title="Daftar BAST Penyerahan"
      />
    </div>
  );
}
