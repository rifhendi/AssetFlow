import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateDocumentNumber, generateTransactionNumber, logAudit } from '@/lib/utils';
import { z } from 'zod';

const offboardingSchema = z.object({
  employeeId: z.string().min(1, 'Karyawan wajib dipilih'),
  terminationType: z.enum(['RETIRED', 'RESIGNED', 'CONTRACT_END', 'MUTATED', 'TERMINATED']),
  effectiveDate: z.string().min(1, 'Tanggal efektif offboarding wajib diisi'),
  returnedAssetIds: z.array(z.string()).default([]),
  returnCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  notes: z.string().optional().nullable(),
  issuerName: z.string().optional().nullable(),
  issuerPosition: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = offboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      employeeId,
      terminationType,
      effectiveDate,
      returnedAssetIds,
      returnCondition,
      notes,
      issuerName,
      issuerPosition,
    } = parsed.data;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, companyId: user.companyId },
      include: {
        department: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: { asset: true },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    const bastType = terminationType === 'RETIRED' ? 'PENSIUN' : 'NON_PENSIUN';
    const documentNumber = await generateDocumentNumber(user.companyId, bastType);
    const effectiveDateTime = new Date(effectiveDate);

    const assignmentsToReturn = employee.assignments.filter((a) =>
      returnedAssetIds.includes(a.assetId)
    );

    const remainingAssets = employee.assignments.filter(
      (a) => !returnedAssetIds.includes(a.assetId)
    );

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BAST Pensiun / Non-Pensiun Document
      const bastDoc = await tx.bastDocument.create({
        data: {
          companyId: user.companyId,
          documentNumber,
          type: bastType,
          title:
            bastType === 'PENSIUN'
              ? 'BERITA ACARA PENYELESAIAN ASET KARYAWAN PENSIUN'
              : 'BERITA ACARA PENYELESAIAN ASET OFFBOARDING KARYAWAN',
          date: effectiveDateTime,
          employeeId: employee.id,
          issuerName: issuerName || user.name,
          issuerPosition: issuerPosition || 'HR & IT Asset Clearance',
          issuerDepartment: 'HR & IT Operations',
          recipientName: employee.fullName,
          recipientNik: employee.nik,
          recipientPosition: employee.position,
          recipientDepartment: employee.department.name,
          reason: terminationType,
          effectiveDate: effectiveDateTime,
          status: 'FINAL',
          notes:
            notes ||
            `Penyelesaian inventaris kedinasan dalam rangka proses offboarding (${terminationType}). Sisa aset outstanding: ${remainingAssets.length} unit.`,
          items: {
            create: assignmentsToReturn.map((assign) => ({
              assetId: assign.asset.id,
              assetTag: assign.asset.assetTag,
              assetName: assign.asset.name,
              brand: assign.asset.brand,
              model: assign.asset.model,
              serialNumber: assign.asset.serialNumber,
              condition: returnCondition,
              notes: 'Pengembalian pada proses offboarding',
              accessories: 'Lengkap',
            })),
          },
        },
      });

      // 2. Process returned assets
      for (const assign of assignmentsToReturn) {
        await tx.assetAssignment.update({
          where: { id: assign.id },
          data: {
            status: 'RETURNED',
            actualReturnDate: effectiveDateTime,
            returnCondition,
            returnNotes: `Offboarding (${terminationType})`,
            returnBastId: bastDoc.id,
          },
        });

        const newStatus =
          returnCondition === 'DAMAGED' || returnCondition === 'POOR'
            ? 'MAINTENANCE'
            : 'AVAILABLE';

        await tx.asset.update({
          where: { id: assign.assetId },
          data: {
            status: newStatus,
            condition: returnCondition,
          },
        });

        const trxNum = await generateTransactionNumber(user.companyId);
        await tx.assetTransaction.create({
          data: {
            companyId: user.companyId,
            transactionNumber: trxNum,
            type: 'CHECKIN',
            assetId: assign.assetId,
            fromEmployeeId: employee.id,
            date: effectiveDateTime,
            condition: returnCondition,
            notes: `Pengembalian aset offboarding (${terminationType})`,
            performedById: user.id,
            bastDocumentId: bastDoc.id,
          },
        });
      }

      // 3. Update employee status to INACTIVE and set terminationType & endDate
      await tx.employee.update({
        where: { id: employee.id },
        data: {
          isActive: remainingAssets.length === 0 ? false : true, // Only deactivate if all assets resolved or keep active with warning
          employmentStatus: terminationType === 'RETIRED' ? 'RETIRED' : 'RESIGNED',
          endDate: effectiveDateTime,
          terminationType,
        },
      });

      return bastDoc;
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: 'OFFBOARD_EMPLOYEE',
      entity: 'EMPLOYEE',
      entityId: employee.id,
      newState: {
        employee: employee.fullName,
        terminationType,
        documentNumber: result.documentNumber,
        returnedCount: assignmentsToReturn.length,
        outstandingCount: remainingAssets.length,
      },
    });

    return NextResponse.json({
      success: true,
      bastDocumentId: result.id,
      documentNumber: result.documentNumber,
      outstandingCount: remainingAssets.length,
    });
  } catch (error: any) {
    console.error('Offboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
