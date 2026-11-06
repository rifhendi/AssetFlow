import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateTransactionNumber, logAudit } from '@/lib/utils';
import { z } from 'zod';

const transferSchema = z.object({
  assetId: z.string().min(1, 'Aset wajib dipilih'),
  toEmployeeId: z.string().optional().nullable(),
  toLocationId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { assetId, toEmployeeId, toLocationId, notes } = parsed.data;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId, companyId: user.companyId },
      include: {
        assignments: { where: { status: 'ACTIVE' }, include: { employee: true } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
    }

    const activeAssignment = asset.assignments[0];
    const fromEmployeeId = activeAssignment?.employeeId || null;
    const fromLocationId = asset.locationId || null;

    const trxNum = await generateTransactionNumber(user.companyId);

    await prisma.$transaction(async (tx) => {
      // If transferring to a different employee
      if (toEmployeeId && toEmployeeId !== fromEmployeeId) {
        if (activeAssignment) {
          await tx.assetAssignment.update({
            where: { id: activeAssignment.id },
            data: {
              status: 'TRANSFERRED',
              actualReturnDate: new Date(),
              returnNotes: `Ditransfer ke karyawan lain`,
            },
          });
        }

        await tx.assetAssignment.create({
          data: {
            companyId: user.companyId,
            assetId: asset.id,
            employeeId: toEmployeeId,
            checkoutDate: new Date(),
            checkoutCondition: asset.condition,
            checkoutNotes: notes || 'Mutasi kepemilikan aset',
            status: 'ACTIVE',
          },
        });

        await tx.asset.update({
          where: { id: asset.id },
          data: {
            status: 'ASSIGNED',
            locationId: toLocationId || asset.locationId,
          },
        });
      } else if (toLocationId) {
        // Just moving location
        await tx.asset.update({
          where: { id: asset.id },
          data: { locationId: toLocationId },
        });
      }

      // Record transaction
      await tx.assetTransaction.create({
        data: {
          companyId: user.companyId,
          transactionNumber: trxNum,
          type: 'TRANSFER',
          assetId: asset.id,
          fromEmployeeId,
          toEmployeeId: toEmployeeId || null,
          fromLocationId,
          toLocationId: toLocationId || null,
          date: new Date(),
          condition: asset.condition,
          notes: notes || 'Transfer perpindahan aset',
          performedById: user.id,
        },
      });
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'TRANSFER_ASSET',
      entity: 'ASSET',
      entityId: asset.id,
      newState: { toEmployeeId, toLocationId, notes },
    });

    return NextResponse.json({ success: true, transactionNumber: trxNum });
  } catch (error: any) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
