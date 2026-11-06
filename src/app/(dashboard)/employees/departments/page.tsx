import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { DepartmentClientView } from './DepartmentClientView';

export default async function DepartmentsPage() {
  const user = await requireAuth();

  const departments = await prisma.department.findMany({
    where: { companyId: user.companyId },
    include: {
      _count: { select: { employees: true, assets: true } },
    },
    orderBy: { name: 'asc' },
  });

  const formatted = departments.map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    description: d.description,
    managerName: d.managerName,
    employeeCount: d._count.employees,
    assetCount: d._count.assets,
  }));

  return (
    <div>
      <PageHeader
        title="Departemen & Divisi"
        description="Kelola unit organisasi perusahaan, penanggung jawab departemen, dan alokasi sumber daya."
        breadcrumbs={[
          { label: 'Employee Management', href: '/employees' },
          { label: 'Departments' },
        ]}
      />
      <DepartmentClientView initialDepartments={formatted} />
    </div>
  );
}
