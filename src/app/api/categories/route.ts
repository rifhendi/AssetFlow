import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori wajib diisi'),
  code: z.string().min(2, 'Kode kategori wajib diisi'),
  prefix: z.string().min(2, 'Prefix tag wajib diisi'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const categories = await prisma.assetCategory.findMany({
      where: { companyId: user.companyId },
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, code, prefix, description, icon } = parsed.data;

    const existing = await prisma.assetCategory.findUnique({
      where: {
        companyId_code: {
          companyId: user.companyId,
          code: code.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Kode kategori sudah digunakan' },
        { status: 400 }
      );
    }

    const newCat = await prisma.assetCategory.create({
      data: {
        companyId: user.companyId,
        code: code.toUpperCase(),
        prefix: prefix.toUpperCase(),
        name,
        description: description || null,
        icon: icon || 'Box',
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE_CATEGORY',
      entity: 'ASSET_CATEGORY',
      entityId: newCat.id,
      newState: newCat,
    });

    return NextResponse.json(newCat, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

