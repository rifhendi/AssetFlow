import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const assetId = searchParams.get('assetId');
    const employeeId = searchParams.get('employeeId');

    const where: any = { companyId: user.companyId };
    if (type) where.type = type;
    if (assetId) where.assetId = assetId;
    if (employeeId) {
      where.OR = [
        { toEmployeeId: employeeId },
        { fromEmployeeId: employeeId },
      ];
    }

    const transactions = await prisma.assetTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        asset: { include: { category: true } },
        toEmployee: { include: { department: true } },
        fromEmployee: { include: { department: true } },
        fromLocation: true,
        toLocation: true,
        performedBy: true,
        bastDocument: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

