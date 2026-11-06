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
    const asset = await prisma.asset.findUnique({
      where: { id: params.id, companyId: user.companyId },
      include: {
        category: true,
        location: true,
        department: true,
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: {
            employee: {
              include: { department: true, location: true },
            },
            checkoutBast: true,
            returnBast: true,
          },
        },
        transactions: {
          orderBy: { date: 'desc' },
          include: {
            fromEmployee: true,
            toEmployee: true,
            fromLocation: true,
            toLocation: true,
            performedBy: true,
            bastDocument: true,
          },
        },
        maintenances: {
          orderBy: { startDate: 'desc' },
        },
        bastItems: {
          include: {
            bastDocument: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(asset);
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

    const existing = await prisma.asset.findUnique({
      where: { id: params.id, companyId: user.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.asset.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        categoryId: body.categoryId ?? existing.categoryId,
        brand: body.brand !== undefined ? body.brand : existing.brand,
        model: body.model !== undefined ? body.model : existing.model,
        serialNumber: body.serialNumber !== undefined ? body.serialNumber : existing.serialNumber,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : existing.purchaseDate,
        purchasePrice: body.purchasePrice !== undefined ? Number(body.purchasePrice) : existing.purchasePrice,
        warrantyExpDate: body.warrantyExpDate ? new Date(body.warrantyExpDate) : existing.warrantyExpDate,
        locationId: body.locationId !== undefined ? body.locationId : existing.locationId,
        departmentId: body.departmentId !== undefined ? body.departmentId : existing.departmentId,
        condition: body.condition ?? existing.condition,
        status: body.status ?? existing.status,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'UPDATE_ASSET',
      entity: 'ASSET',
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

    const existing = await prisma.asset.findUnique({
      where: { id: params.id, companyId: user.companyId },
      include: { assignments: { where: { status: 'ACTIVE' } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
    }

    if (existing.assignments.length > 0) {
      return NextResponse.json(
        { error: 'Aset sedang dipinjam oleh karyawan. Harap lakukan return terlebih dahulu.' },
        { status: 400 }
      );
    }

    await prisma.asset.delete({
      where: { id: params.id },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'DELETE_ASSET',
      entity: 'ASSET',
      entityId: params.id,
      previousState: existing,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
