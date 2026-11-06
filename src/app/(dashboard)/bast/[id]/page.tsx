import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BastDocumentPrintView } from '@/components/bast/BastDocumentPrintView';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { BastActionBar } from './BastActionBar';

interface BastDetailPageProps {
  params: { id: string };
}

export default async function BastDetailPage({ params }: BastDetailPageProps) {
  const user = await requireAuth();

  const document = await prisma.bastDocument.findUnique({
    where: { id: params.id, companyId: user.companyId },
    include: {
      company: true,
      items: true,
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title={`Dokumen BAST: ${document.documentNumber}`}
          description={`Jenis: ${document.type} • Tanggal: ${new Date(document.date).toLocaleDateString('id-ID')}`}
          breadcrumbs={[
            { label: 'BAST Management', href: '/bast' },
            { label: document.documentNumber },
          ]}
          actions={<BastActionBar documentNumber={document.documentNumber} />}
        />
      </div>

      <BastDocumentPrintView document={document} />
    </div>
  );
}
