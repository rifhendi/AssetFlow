import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { SettingsClientView } from './SettingsClientView';

export default async function SettingsPage() {
  const user = await requireAuth();

  const [company, users, templates, auditLogs] = await Promise.all([
    prisma.company.findUnique({
      where: { id: user.companyId },
    }),
    prisma.user.findMany({
      where: { companyId: user.companyId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bastTemplate.findMany({
      where: { companyId: user.companyId },
      orderBy: { type: 'asc' },
    }),
    prisma.auditLog.findMany({
      where: { companyId: user.companyId },
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Pengaturan Sistem & Profil Perusahaan"
        description="Kelola profil organisasi, hak akses pengguna, template dokumen BAST, dan konfigurasi multi-tenant SaaS."
        breadcrumbs={[{ label: 'Settings' }]}
      />
      <SettingsClientView
        company={company}
        users={users}
        templates={templates}
        auditLogs={auditLogs}
        currentUserRole={user.role}
      />
    </div>
  );
}

