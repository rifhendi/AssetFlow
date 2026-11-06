import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const employeeSchema = z.object({
  nik: z.string().min(2, 'Nomor Induk Karyawan (NIK) wajib diisi'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  email: z.string().email('Alamat email tidak valid'),
  phone: z.string().optional().nullable(),
  departmentId: z.string().min(1, 'Departemen wajib dipilih'),
  position: z.string().min(2, 'Jabatan wajib diisi'),
  employmentStatus: z
    .enum([
      'PERMANENT',
      'CONTRACT',
      'PROBATION',
      'INTERN',
      'RESIGNED',
      'RETIRED',
      'MUTATED',
      'TERMINATED',
    ])
    .default('PERMANENT'),
  joinDate: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const departmentId = searchParams.get('department');
    const status = searchParams.get('status');
    const locationId = searchParams.get('location');

    const where: any = { companyId: user.companyId };

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { nik: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (departmentId) where.departmentId = departmentId;
    if (status) where.employmentStatus = status;
    if (locationId) where.locationId = locationId;

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        location: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { asset: true },
        },
      },
    });

    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = employeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.employee.findUnique({
      where: {
        companyId_nik: {
          companyId: user.companyId,
          nik: data.nik,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `NIK ${data.nik} sudah terdaftar` },
        { status: 400 }
      );
    }

    const newEmp = await prisma.employee.create({
      data: {
        companyId: user.companyId,
        nik: data.nik,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        departmentId: data.departmentId,
        position: data.position,
        employmentStatus: data.employmentStatus,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        locationId: data.locationId || null,
        notes: data.notes || null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE_EMPLOYEE',
      entity: 'EMPLOYEE',
      entityId: newEmp.id,
      newState: newEmp,
    });

    return NextResponse.json(newEmp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
