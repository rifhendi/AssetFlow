import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { exportToExcel } from '@/lib/excel';
import { formatDateShort } from '@/lib/utils';
import { EMPLOYMENT_STATUSES } from '@/lib/constants';

export async function GET() {
  try {
    const user = await requireAuth();

    const employees = await prisma.employee.findMany({
      where: { companyId: user.companyId },
      include: {
        department: true,
        location: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { asset: true },
        },
      },
      orderBy: { nik: 'asc' },
    });

    const rows = employees.map((e, idx) => ({
      No: idx + 1,
      NIK: e.nik,
      'Nama Lengkap': e.fullName,
      Departemen: e.department.name,
      Jabatan: e.position,
      Email: e.email,
      'Nomor Telepon': e.phone || '-',
      'Status Karyawan':
        EMPLOYMENT_STATUSES[e.employmentStatus as keyof typeof EMPLOYMENT_STATUSES]?.label ||
        e.employmentStatus,
      'Tanggal Bergabung': formatDateShort(e.joinDate),
      Lokasi: e.location ? e.location.name : '-',
      'Jumlah Aset Dipinjam': e.assignments.length,
      'Aset Dipinjam': e.assignments
        .map((a) => `${a.asset.name} (${a.asset.assetTag})`)
        .join(', ') || 'Tidak ada',
      'Status Aktif': e.isActive ? 'Aktif' : 'Nonaktif',
    }));

    const buffer = exportToExcel(rows, 'Daftar_Karyawan_AssetFlow.xlsx', 'Karyawan');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Daftar_Karyawan_AssetFlow_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

