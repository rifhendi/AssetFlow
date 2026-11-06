import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(2, 'Nama departemen wajib diisi'),
  code: z.string().min(2, 'Kode departemen wajib diisi'),
  description: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const departments = await prisma.department.findMany({
      where: { companyId: user.companyId },
      include: {
        _count: { select: { employees: true, assets: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, code, description, managerName } = parsed.data;

    const existing = await prisma.department.findUnique({
      where: {
        companyId_code: {
          companyId: user.companyId,
          code: code.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Kode departemen sudah digunakan' },
        { status: 400 }
      );
    }

    const newDept = await prisma.department.create({
      data: {
        companyId: user.companyId,
        code: code.toUpperCase(),
        name,
        description: description || null,
        managerName: managerName || null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE_DEPARTMENT',
      entity: 'DEPARTMENT',
      entityId: newDept.id,
      newState: newDept,
    });

    return NextResponse.json(newDept, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
