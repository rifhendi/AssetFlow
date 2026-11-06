import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/utils';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(2, 'Nama lokasi wajib diisi'),
  code: z.string().min(2, 'Kode lokasi wajib diisi'),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const locations = await prisma.assetLocation.findMany({
      where: { companyId: user.companyId },
      include: {
        _count: { select: { assets: true, employees: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, code, building, floor, room, description } = parsed.data;

    const existing = await prisma.assetLocation.findUnique({
      where: {
        companyId_code: {
          companyId: user.companyId,
          code: code.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Kode lokasi sudah digunakan' },
        { status: 400 }
      );
    }

    const newLoc = await prisma.assetLocation.create({
      data: {
        companyId: user.companyId,
        code: code.toUpperCase(),
        name,
        building: building || null,
        floor: floor || null,
        room: room || null,
        description: description || null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE_LOCATION',
      entity: 'ASSET_LOCATION',
      entityId: newLoc.id,
      newState: newLoc,
    });

    return NextResponse.json(newLoc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
