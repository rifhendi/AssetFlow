import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { parseExcelBuffer } from '@/lib/excel';
import { logAudit } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File Excel wajib diunggah' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rows = parseExcelBuffer(buffer);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'File Excel kosong atau format tidak sesuai' }, { status: 400 });
    }

    // Cache categories, locations, departments
    const [categories, locations, departments] = await Promise.all([
      prisma.assetCategory.findMany({ where: { companyId: user.companyId } }),
      prisma.assetLocation.findMany({ where: { companyId: user.companyId } }),
      prisma.department.findMany({ where: { companyId: user.companyId } }),
    ]);

    const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const locMap = new Map(locations.map((l) => [l.name.toLowerCase(), l.id]));
    const deptMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));

    const defaultCategory = categories[0];
    let importedCount = 0;

    for (const row of rows) {
      const name = row['Nama Aset'] || row['name'] || row['Nama'];
      if (!name) continue;

      const categoryName = (row['Kategori'] || row['category'] || '').toLowerCase();
      const categoryId = catMap.get(categoryName) || defaultCategory.id;

      const category = categories.find((c) => c.id === categoryId);
      const prefix = category?.prefix || 'AST';

      const count = await prisma.asset.count({
        where: { companyId: user.companyId, categoryId },
      });
      const assetTag = row['Asset Tag'] || `${prefix}-${String(count + 1).padStart(3, '0')}`;

      const locationName = (row['Lokasi'] || row['location'] || '').toLowerCase();
      const locationId = locMap.get(locationName) || null;

      const deptName = (row['Departemen'] || row['department'] || '').toLowerCase();
      const departmentId = deptMap.get(deptName) || null;

      const brand = row['Brand'] || row['brand'] || null;
      const model = row['Model'] || row['model'] || null;
      const serialNumber = row['Serial Number'] || row['serialNumber'] || row['SN'] || null;
      const purchasePrice = row['Harga Pembelian'] ? Number(String(row['Harga Pembelian']).replace(/[^0-9]/g, '')) : null;

      await prisma.asset.upsert({
        where: {
          companyId_assetTag: {
            companyId: user.companyId,
            assetTag: String(assetTag),
          },
        },
        update: {
          name: String(name),
          brand: brand ? String(brand) : null,
          model: model ? String(model) : null,
          serialNumber: serialNumber ? String(serialNumber) : null,
          purchasePrice,
          locationId,
          departmentId,
        },
        create: {
          companyId: user.companyId,
          assetTag: String(assetTag),
          name: String(name),
          categoryId,
          brand: brand ? String(brand) : null,
          model: model ? String(model) : null,
          serialNumber: serialNumber ? String(serialNumber) : null,
          purchasePrice,
          locationId,
          departmentId,
          condition: 'GOOD',
          status: 'AVAILABLE',
          qrCode: `ASSETFLOW:${assetTag}:${serialNumber || ''}`,
        },
      });

      importedCount++;
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'IMPORT_EXCEL_ASSETS',
      entity: 'ASSET',
      newState: { importedCount },
    });

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

