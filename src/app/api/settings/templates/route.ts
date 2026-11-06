import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/utils';

export async function GET() {
  try {
    const admin = await requireRole(['SUPER_ADMIN', 'ADMIN_ASSET', 'HR_ADMIN']);
    const templates = await prisma.bastTemplate.findMany({
      where: { companyId: admin.companyId },
      orderBy: { type: 'asc' },
    });
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireRole(['SUPER_ADMIN', 'ADMIN_ASSET']);
    const body = await request.json();
    const { id, title, headerText, termsAndConditions, footerText } = body;

    const updated = await prisma.bastTemplate.update({
      where: { id, companyId: admin.companyId },
      data: {
        title,
        headerText,
        termsAndConditions,
        footerText,
      },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: 'UPDATE_BAST_TEMPLATE',
      entity: 'BAST_TEMPLATE',
      entityId: id,
      newState: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
