import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeTable } from '@/components/employees/EmployeeTable';

export default async function EmployeesPage() {
  const user = await requireAuth();

  const [employees, departments, locations] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: user.companyId },
      include: {
        department: true,
        location: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { asset: true },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
    }),
    prisma.assetLocation.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Daftar Karyawan"
        description="Kelola data pegawai perusahaan, status kepegawaian, penempatan kerja, dan pemegang aset inventaris."
        breadcrumbs={[
          { label: 'Employee Management' },
          { label: 'Employee List' },
        ]}
      />
      <EmployeeTable
        initialEmployees={employees}
        departments={departments}
        locations={locations}
      />
    </div>
  );
}
