import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN_ASSET', 'HR_ADMIN', 'EMPLOYEE', 'AUDITOR']),
  employeeId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const admin = await requireRole(['SUPER_ADMIN', 'ADMIN_ASSET', 'HR_ADMIN']);
    const users = await prisma.user.findMany({
      where: { companyId: admin.companyId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      employee: u.employee ? { id: u.employee.id, fullName: u.employee.fullName } : null,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(['SUPER_ADMIN']);
    const body = await request.json();

    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role, employeeId } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email tersebut sudah terdaftar di sistem' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        companyId: admin.companyId,
        name,
        email,
        password: passwordHash,
        role,
        employeeId: employeeId || null,
      },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: 'CREATE_USER',
      entity: 'USER',
      entityId: newUser.id,
      newState: { email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({ success: true, id: newUser.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireRole(['SUPER_ADMIN']);
    const body = await request.json();
    const { userId, role, isActive } = body;

    const updated = await prisma.user.update({
      where: { id: userId, companyId: admin.companyId },
      data: {
        role: role !== undefined ? role : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: 'UPDATE_USER_ROLE_STATUS',
      entity: 'USER',
      entityId: userId,
      newState: { role: updated.role, isActive: updated.isActive },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

