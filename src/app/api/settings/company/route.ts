import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/utils';

export async function GET() {
  try {
    const user = await requireAuth();
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
    });
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole(['SUPER_ADMIN', 'ADMIN_ASSET']);
    const body = await request.json();

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        bastNumberFormat: body.bastNumberFormat,
        signatureTitle1: body.signatureTitle1,
        signatureName1: body.signatureName1,
        signatureTitle2: body.signatureTitle2,
        signatureName2: body.signatureName2,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'UPDATE_COMPANY_PROFILE',
      entity: 'COMPANY',
      entityId: user.companyId,
      newState: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

