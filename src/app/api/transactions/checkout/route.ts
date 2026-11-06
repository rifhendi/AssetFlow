import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateDocumentNumber, generateTransactionNumber, logAudit } from '@/lib/utils';
import { z } from 'zod';

const checkoutSchema = z.object({
  employeeId: z.string().min(1, 'Karyawan penerima wajib dipilih'),
  assetIds: z.array(z.string()).min(1, 'Minimal satu aset wajib dipilih'),
  checkoutDate: z.string().optional(),
  expectedReturnDate: z.string().optional().nullable(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  accessories: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  issuerName: z.string().optional().nullable(),
  issuerPosition: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      employeeId,
      assetIds,
      checkoutDate,
      expectedReturnDate,
      condition,
      accessories,
      notes,
      issuerName,
      issuerPosition,
    } = parsed.data;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, companyId: user.companyId },
      include: { department: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Verify all selected assets are currently AVAILABLE
    const assets = await prisma.asset.findMany({
      where: {
        id: { in: assetIds },
        companyId: user.companyId,
      },
      include: { category: true },
    });

    if (assets.length !== assetIds.length) {
      return NextResponse.json(
        { error: 'Satu atau lebih aset yang dipilih tidak valid' },
        { status: 400 }
      );
    }

    const unavailableAssets = assets.filter((a) => a.status !== 'AVAILABLE');
    if (unavailableAssets.length > 0) {
      return NextResponse.json(
        {
          error: `Aset ${unavailableAssets.map((a) => a.assetTag).join(', ')} sedang tidak tersedia (status: ${unavailableAssets[0].status})`,
        },
        { status: 400 }
      );
    }

    // Generate BAST Document Number
    const documentNumber = await generateDocumentNumber(user.companyId, 'PENYERAHAN');
    const transactionDate = checkoutDate ? new Date(checkoutDate) : new Date();

    // Execute atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BAST Document
      const bastDoc = await tx.bastDocument.create({
        data: {
          companyId: user.companyId,
          documentNumber,
          type: 'PENYERAHAN',
          title: 'BERITA ACARA SERAH TERIMA ASET (PENYERAHAN)',
          date: transactionDate,
          employeeId: employee.id,
          issuerName: issuerName || user.name,
          issuerPosition: issuerPosition || 'IT Asset Management',
          issuerDepartment: 'Information & Technology',
          recipientName: employee.fullName,
          recipientNik: employee.nik,
          recipientPosition: employee.position,
          recipientDepartment: employee.department.name,
          status: 'FINAL',
          notes: notes || 'Serah terima fasilitas perangkat kerja perusahaan.',
          items: {
            create: assets.map((a) => ({
              assetId: a.id,
              assetTag: a.assetTag,
              assetName: a.name,
              brand: a.brand,
              model: a.model,
              serialNumber: a.serialNumber,
              condition,
              notes: notes || null,
              accessories: accessories || 'Lengkap',
            })),
          },
        },
      });

      // 2. Process each asset
      for (const asset of assets) {
        // Update asset status
        await tx.asset.update({
          where: { id: asset.id },
          data: {
            status: 'ASSIGNED',
            condition,
          },
        });

        // Create assignment record
        await tx.assetAssignment.create({
          data: {
            companyId: user.companyId,
            assetId: asset.id,
            employeeId: employee.id,
            checkoutDate: transactionDate,
            expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
            checkoutCondition: condition,
            checkoutNotes: notes || null,
            accessories: accessories || null,
            status: 'ACTIVE',
            checkoutBastId: bastDoc.id,
          },
        });

        // Create transaction record
        const trxNum = await generateTransactionNumber(user.companyId);
        await tx.assetTransaction.create({
          data: {
            companyId: user.companyId,
            transactionNumber: trxNum,
            type: 'CHECKOUT',
            assetId: asset.id,
            toEmployeeId: employee.id,
            date: transactionDate,
            condition,
            notes: notes || `Penyerahan aset kepada ${employee.fullName}`,
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
      action: 'CHECKOUT_ASSETS',
      entity: 'ASSET_ASSIGNMENT',
      newState: {
        employee: employee.fullName,
        documentNumber: result.documentNumber,
        assetCount: assets.length,
      },
    });

    return NextResponse.json({
      success: true,
      bastDocumentId: result.id,
      documentNumber: result.documentNumber,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

