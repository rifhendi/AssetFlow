import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const employee = await prisma.employee.findUnique({
      where: { id: params.id, companyId: user.companyId },
      include: {
        department: true,
        location: true,
        assignments: {
          orderBy: { checkoutDate: 'desc' },
          include: {
            asset: {
              include: { category: true, location: true },
            },
            checkoutBast: true,
            returnBast: true,
          },
        },
        bastDocuments: {
          orderBy: { date: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const existing = await prisma.employee.findUnique({
      where: { id: params.id, companyId: user.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.employee.update({
      where: { id: params.id },
      data: {
        nik: body.nik ?? existing.nik,
        fullName: body.fullName ?? existing.fullName,
        email: body.email ?? existing.email,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        departmentId: body.departmentId ?? existing.departmentId,
        position: body.position ?? existing.position,
        employmentStatus: body.employmentStatus ?? existing.employmentStatus,
        joinDate: body.joinDate ? new Date(body.joinDate) : existing.joinDate,
        locationId: body.locationId !== undefined ? body.locationId : existing.locationId,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'UPDATE_EMPLOYEE',
      entity: 'EMPLOYEE',
      entityId: params.id,
      previousState: existing,
      newState: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const existing = await prisma.employee.findUnique({
      where: { id: params.id, companyId: user.companyId },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    if (existing.assignments.length > 0) {
      return NextResponse.json(
        { error: 'Karyawan masih memegang aset aktif. Lakukan return atau offboarding terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Soft delete / deactivate employee
    const deactivated = await prisma.employee.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'DEACTIVATE_EMPLOYEE',
      entity: 'EMPLOYEE',
      entityId: params.id,
      previousState: existing,
      newState: deactivated,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

