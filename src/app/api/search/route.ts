import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({ assets: [], employees: [], documents: [] });
    }

    const [assets, employees, documents] = await Promise.all([
      prisma.asset.findMany({
        where: {
          companyId: user.companyId,
          OR: [
            { assetTag: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { serialNumber: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          assetTag: true,
          name: true,
          status: true,
          brand: true,
        },
      }),
      prisma.employee.findMany({
        where: {
          companyId: user.companyId,
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { nik: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          nik: true,
          position: true,
        },
      }),
      prisma.bastDocument.findMany({
        where: {
          companyId: user.companyId,
          OR: [
            { documentNumber: { contains: query, mode: 'insensitive' } },
            { recipientName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          documentNumber: true,
          recipientName: true,
          type: true,
        },
      }),
    ]);

    return NextResponse.json({ assets, employees, documents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal melakukan pencarian' },
      { status: 500 }
    );
  }
}

