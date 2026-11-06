import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransactionHistoryTable } from './TransactionHistoryTable';

export default async function TransactionHistoryPage() {
  const user = await requireAuth();

  const transactions = await prisma.assetTransaction.findMany({
    where: { companyId: user.companyId },
    orderBy: { date: 'desc' },
    include: {
      asset: { include: { category: true } },
      toEmployee: { include: { department: true } },
      fromEmployee: { include: { department: true } },
      fromLocation: true,
      toLocation: true,
      performedBy: true,
      bastDocument: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Riwayat Seluruh Transaksi Aset"
        description="Audit trail lengkap seluruh pergerakan checkout, return, mutasi, dan perbaikan perangkat inventaris."
        breadcrumbs={[
          { label: 'Asset Transactions' },
          { label: 'Transaction History' },
        ]}
      />
      <TransactionHistoryTable initialTransactions={transactions} />
    </div>
  );
}
