import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateDocumentNumber, generateTransactionNumber, logAudit } from '@/lib/utils';
import { z } from 'zod';

const checkinSchema = z.object({
  employeeId: z.string().min(1, 'Karyawan pengembali wajib dipilih'),
  assetIds: z.array(z.string()).min(1, 'Pilih minimal satu aset yang dikembalikan'),
  returnDate: z.string().optional(),
  returnCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  returnNotes: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPosition: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = checkinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      employeeId,
      assetIds,
      returnDate,
      returnCondition,
      returnNotes,
      accessories,
      receiverName,
      receiverPosition,
    } = parsed.data;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, companyId: user.companyId },
      include: { department: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Find active assignments
    const assignments = await prisma.assetAssignment.findMany({
      where: {
        companyId: user.companyId,
        employeeId: employee.id,
        assetId: { in: assetIds },
        status: 'ACTIVE',
      },
      include: { asset: true },
    });

    if (assignments.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ditemukan aset aktif yang dipinjam oleh karyawan ini' },
        { status: 400 }
      );
    }

    const documentNumber = await generateDocumentNumber(user.companyId, 'PENGEMBALIAN');
    const transactionDate = returnDate ? new Date(returnDate) : new Date();

    const newAssetStatus =
      returnCondition === 'DAMAGED' || returnCondition === 'POOR'
        ? 'MAINTENANCE'
        : 'AVAILABLE';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BAST Pengembalian Document
      const bastDoc = await tx.bastDocument.create({
        data: {
          companyId: user.companyId,
          documentNumber,
          type: 'PENGEMBALIAN',
          title: 'BERITA ACARA PENGEMBALIAN ASET INVENTARIS',
          date: transactionDate,
          employeeId: employee.id,
          issuerName: receiverName || user.name,
          issuerPosition: receiverPosition || 'IT Asset Management',
          issuerDepartment: 'Information & Technology',
          recipientName: employee.fullName,
          recipientNik: employee.nik,
          recipientPosition: employee.position,
          recipientDepartment: employee.department.name,
          status: 'FINAL',
          notes: returnNotes || 'Pengembalian inventaris dinas perusahaan.',
          items: {
            create: assignments.map((assign) => ({
              assetId: assign.asset.id,
              assetTag: assign.asset.assetTag,
              assetName: assign.asset.name,
              brand: assign.asset.brand,
              model: assign.asset.model,
              serialNumber: assign.asset.serialNumber,
              condition: returnCondition,
              notes: returnNotes || null,
              accessories: accessories || 'Lengkap',
            })),
          },
        },
      });

      // 2. Update assignments and assets
      for (const assign of assignments) {
        // Update assignment
        await tx.assetAssignment.update({
          where: { id: assign.id },
          data: {
            status: 'RETURNED',
            actualReturnDate: transactionDate,
            returnCondition,
            returnNotes: returnNotes || null,
            returnBastId: bastDoc.id,
          },
        });

        // Update asset
        await tx.asset.update({
          where: { id: assign.assetId },
          data: {
            status: newAssetStatus,
            condition: returnCondition,
          },
        });

        // Create transaction log
        const trxNum = await generateTransactionNumber(user.companyId);
        await tx.assetTransaction.create({
          data: {
            companyId: user.companyId,
            transactionNumber: trxNum,
            type: 'CHECKIN',
            assetId: assign.assetId,
            fromEmployeeId: employee.id,
            date: transactionDate,
            condition: returnCondition,
            notes: returnNotes || `Pengembalian aset oleh ${employee.fullName}`,
            performedById: user.id,
            bastDocumentId: bastDoc.id,
          },
        });
      }

      return bastDoc;
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'RETURN_ASSETS',
      entity: 'ASSET_ASSIGNMENT',
      newState: {
        employee: employee.fullName,
        documentNumber: result.documentNumber,
        assetCount: assignments.length,
      },
    });

    return NextResponse.json({
      success: true,
      bastDocumentId: result.id,
      documentNumber: result.documentNumber,
    });
  } catch (error: any) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

