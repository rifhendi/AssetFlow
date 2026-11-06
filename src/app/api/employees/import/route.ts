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

    const [departments, locations] = await Promise.all([
      prisma.department.findMany({ where: { companyId: user.companyId } }),
      prisma.assetLocation.findMany({ where: { companyId: user.companyId } }),
    ]);

    const deptMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));
    const locMap = new Map(locations.map((l) => [l.name.toLowerCase(), l.id]));

    const defaultDept = departments[0];
    let importedCount = 0;

    for (const row of rows) {
      const nik = row['NIK'] || row['nik'];
      const fullName = row['Nama Lengkap'] || row['Nama'] || row['fullName'];
      const email = row['Email'] || row['email'];
      const position = row['Jabatan'] || row['position'] || 'Staff';

      if (!nik || !fullName || !email) continue;

      const deptName = (row['Departemen'] || row['department'] || '').toLowerCase();
      const departmentId = deptMap.get(deptName) || defaultDept.id;

      const locName = (row['Lokasi'] || row['location'] || '').toLowerCase();
      const locationId = locMap.get(locName) || null;

      const phone = row['Nomor Telepon'] || row['Telepon'] || row['phone'] || null;

      await prisma.employee.upsert({
        where: {
          companyId_nik: {
            companyId: user.companyId,
            nik: String(nik),
          },
        },
        update: {
          fullName: String(fullName),
          email: String(email),
          position: String(position),
          departmentId,
          locationId,
          phone: phone ? String(phone) : null,
        },
        create: {
          companyId: user.companyId,
          nik: String(nik),
          fullName: String(fullName),
          email: String(email),
          position: String(position),
          departmentId,
          locationId,
          phone: phone ? String(phone) : null,
          employmentStatus: 'PERMANENT',
        },
      });

      importedCount++;
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'IMPORT_EXCEL_EMPLOYEES',
      entity: 'EMPLOYEE',
      newState: { importedCount },
    });

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

