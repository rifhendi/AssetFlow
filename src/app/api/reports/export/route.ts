import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { exportToExcel } from '@/lib/excel';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'inventory';

    let dataRows: Record<string, any>[] = [];
    let fileName = `Laporan_AssetFlow_${reportType}.xlsx`;
    let sheetName = 'Laporan';

    if (reportType === 'inventory') {
      const assets = await prisma.asset.findMany({
        where: { companyId: user.companyId },
        include: {
          category: true,
          location: true,
          department: true,
          assignments: { where: { status: 'ACTIVE' }, include: { employee: true } },
        },
        orderBy: { assetTag: 'asc' },
      });

      dataRows = assets.map((a, i) => ({
        No: i + 1,
        'Asset Tag': a.assetTag,
        'Nama Aset': a.name,
        Kategori: a.category.name,
        Brand: a.brand || '-',
        Model: a.model || '-',
        'Serial Number': a.serialNumber || '-',
        Status: ASSET_STATUSES[a.status as keyof typeof ASSET_STATUSES]?.label || a.status,
        Kondisi: ASSET_CONDITIONS[a.condition as keyof typeof ASSET_CONDITIONS]?.label || a.condition,
        Lokasi: a.location?.name || '-',
        Departemen: a.department?.name || '-',
        'Pemegang Saat Ini': a.assignments[0] ? a.assignments[0].employee.fullName : 'Tersedia',
        'Harga Pembelian': formatCurrency(a.purchasePrice),
        'Tanggal Pembelian': formatDateShort(a.purchaseDate),
      }));
      fileName = 'Laporan_Inventaris_Aset.xlsx';
      sheetName = 'Inventaris Aset';
    } else if (reportType === 'employees') {
      const employees = await prisma.employee.findMany({
        where: { companyId: user.companyId },
        include: {
          department: true,
          location: true,
          assignments: { where: { status: 'ACTIVE' }, include: { asset: true } },
        },
        orderBy: { fullName: 'asc' },
      });

      dataRows = employees.map((e, i) => ({
        No: i + 1,
        NIK: e.nik,
        'Nama Lengkap': e.fullName,
        Departemen: e.department.name,
        Jabatan: e.position,
        Status: e.employmentStatus,
        'Jumlah Aset': e.assignments.length,
        'Daftar Aset': e.assignments.map((a) => a.asset.name).join(', ') || '-',
      }));
      fileName = 'Laporan_Aset_Karyawan.xlsx';
      sheetName = 'Aset Karyawan';
    } else if (reportType === 'movement') {
      const trxs = await prisma.assetTransaction.findMany({
        where: { companyId: user.companyId },
        include: {
          asset: true,
          toEmployee: true,
          fromEmployee: true,
          bastDocument: true,
        },
        orderBy: { date: 'desc' },
      });

      dataRows = trxs.map((t, i) => ({
        No: i + 1,
        'No Transaksi': t.transactionNumber,
        Tipe: t.type,
        'Asset Tag': t.asset.assetTag,
        'Nama Aset': t.asset.name,
        Tanggal: formatDateShort(t.date),
        'Pihak Penerima': t.toEmployee?.fullName || '-',
        'Pihak Pengembali': t.fromEmployee?.fullName || '-',
        'No BAST': t.bastDocument?.documentNumber || '-',
        Catatan: t.notes || '-',
      }));
      fileName = 'Laporan_Mutasi_Aset.xlsx';
      sheetName = 'Mutasi Aset';
    } else if (reportType === 'retirement') {
      const retired = await prisma.asset.findMany({
        where: {
          companyId: user.companyId,
          status: { in: ['RETIRED', 'DISPOSED'] },
        },
        include: { category: true, location: true },
        orderBy: { updatedAt: 'desc' },
      });

      dataRows = retired.map((r, i) => ({
        No: i + 1,
        'Asset Tag': r.assetTag,
        'Nama Aset': r.name,
        Kategori: r.category.name,
        Status: r.status,
        Kondisi: r.condition,
        'Harga Pembelian': formatCurrency(r.purchasePrice),
        Catatan: r.notes || '-',
      }));
      fileName = 'Laporan_Purna_Aset.xlsx';
      sheetName = 'Purna Aset';
    }

    const buffer = exportToExcel(dataRows, fileName, sheetName);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
