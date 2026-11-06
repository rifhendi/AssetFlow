import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { OffboardingWizard } from './OffboardingWizard';

export default async function OffboardingPage({
  searchParams,
}: {
  searchParams: { employeeId?: string };
}) {
  const user = await requireAuth();

  const employees = await prisma.employee.findMany({
    where: { companyId: user.companyId, isActive: true },
    include: {
      department: true,
      assignments: {
        where: { status: 'ACTIVE' },
        include: {
          asset: {
            include: { category: true, location: true },
          },
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  return (
    <div>
      <PageHeader
        title="Employee Offboarding & Asset Clearance"
        description="Kelola penyelesaian inventaris karyawan pensiun, resign, atau mutasi. Lacak aset outstanding dan terbitkan BAST Pensiun/Non-Pensiun resmi."
        breadcrumbs={[
          { label: 'Employee Management', href: '/employees' },
          { label: 'Employee Offboarding' },
        ]}
      />
      <OffboardingWizard
        employees={employees}
        preselectedEmployeeId={searchParams.employeeId}
        currentUserName={user.name}
      />
    </div>
  );
}

