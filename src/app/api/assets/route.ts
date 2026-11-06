import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const assetSchema = z.object({
  name: z.string().min(2, 'Nama aset wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.number().or(z.string()).optional().nullable(),
  warrantyExpDate: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  status: z.enum([
    'AVAILABLE',
    'ASSIGNED',
    'IN_USE',
    'MAINTENANCE',
    'RETURNED',
    'RETIRED',
    'LOST',
    'DISPOSED',
  ]).default('AVAILABLE'),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('category');
    const locationId = searchParams.get('location');
    const departmentId = searchParams.get('department');
    const status = searchParams.get('status');

    const where: any = { companyId: user.companyId };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { assetTag: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.locationId = locationId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = assetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get category prefix to generate automatic Asset Tag
    const category = await prisma.assetCategory.findUnique({
      where: { id: data.categoryId },
    });
    const prefix = category?.prefix || 'AST';

    const count = await prisma.asset.count({
      where: {
        companyId: user.companyId,
        categoryId: data.categoryId,
      },
    });
    const assetTag = `${prefix}-${String(count + 1).padStart(3, '0')}`;

    const newAsset = await prisma.asset.create({
      data: {
        companyId: user.companyId,
        assetTag,
        name: data.name,
        categoryId: data.categoryId,
        brand: data.brand || null,
        model: data.model || null,
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
        warrantyExpDate: data.warrantyExpDate ? new Date(data.warrantyExpDate) : null,
        locationId: data.locationId || null,
        departmentId: data.departmentId || null,
        condition: data.condition,
        status: data.status,
        notes: data.notes || null,
        imageUrl: data.imageUrl || null,
        qrCode: `ASSETFLOW:${assetTag}:${data.serialNumber || ''}`,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE_ASSET',
      entity: 'ASSET',
      entityId: newAsset.id,
      newState: newAsset,
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

