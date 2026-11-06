import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { exportToExcel } from '@/lib/excel';
import { formatDateShort, formatCurrency } from '@/lib/utils';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await requireAuth();

    const assets = await prisma.asset.findMany({
      where: { companyId: user.companyId },
      include: {
        category: true,
        location: true,
        department: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { employee: true },
          take: 1,
        },
      },
      orderBy: { assetTag: 'asc' },
    });

    const rows = assets.map((a, idx) => ({
      No: idx + 1,
      'Asset Tag': a.assetTag,
      'Nama Aset': a.name,
      Kategori: a.category.name,
      Brand: a.brand || '-',
      Model: a.model || '-',
      'Serial Number': a.serialNumber || '-',
      Status: ASSET_STATUSES[a.status as keyof typeof ASSET_STATUSES]?.label || a.status,
      Kondisi: ASSET_CONDITIONS[a.condition as keyof typeof ASSET_CONDITIONS]?.label || a.condition,
      Lokasi: a.location ? a.location.name : '-',
      Departemen: a.department ? a.department.name : '-',
      'Pengguna Saat Ini': a.assignments[0] ? `${a.assignments[0].employee.fullName} (${a.assignments[0].employee.nik})` : 'Tersedia',
      'Harga Pembelian': formatCurrency(a.purchasePrice),
      'Tanggal Pembelian': formatDateShort(a.purchaseDate),
      'Garansi Berakhir': formatDateShort(a.warrantyExpDate),
      Catatan: a.notes || '-',
    }));

    const buffer = exportToExcel(rows, 'Daftar_Aset_AssetFlow.xlsx', 'Daftar Aset');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Daftar_Aset_AssetFlow_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
