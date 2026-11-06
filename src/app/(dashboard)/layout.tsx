import React from 'react';
import { requireAuth } from '@/lib/auth';
import { DashboardShell } from './DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
