import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastTable } from '@/components/bast/BastTable';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft } from 'lucide-react';

export default async function AllBastPage() {
  const user = await requireAuth();

  const documents = await prisma.bastDocument.findMany({
    where: { companyId: user.companyId },
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Arsip Berita Acara Serah Terima (BAST)"
        description="Pusat penyimpanan, pelacakan, dan cetak ulang seluruh dokumen resmi serah terima dan penyelesaian inventaris perusahaan."
        breadcrumbs={[
          { label: 'BAST Management' },
          { label: 'All Documents' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 shadow-xs">
              <Link href="/transactions/checkout">
                <Plus className="h-4 w-4" />
                Terbitkan BAST Penyerahan
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 shadow-xs">
              <Link href="/transactions/checkin">
                <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                Terbitkan BAST Pengembalian
              </Link>
            </Button>
          </div>
        }
      />
      <BastTable initialDocuments={documents} />
    </div>
  );
}
