import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { prisma } from './prisma';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export async function generateDocumentNumber(
  companyId: string,
  type: 'PENYERAHAN' | 'PENGEMBALIAN' | 'PENSIUN' | 'NON_PENSIUN'
): Promise<string> {
  const typeMap = {
    PENYERAHAN: 'PEN',
    PENGEMBALIAN: 'RET',
    PENSIUN: 'PENSIUN',
    NON_PENSIUN: 'OFFB',
  };

  const prefix = typeMap[type] || 'DOC';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Count existing documents of this type this month
  const count = await prisma.bastDocument.count({
    where: {
      companyId,
      type,
      createdAt: {
        gte: new Date(year, now.getMonth(), 1),
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `BAST/${prefix}/${year}/${month}/${seq}`;
}

export async function generateTransactionNumber(companyId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const count = await prisma.assetTransaction.count({
    where: {
      companyId,
      createdAt: {
        gte: new Date(year, now.getMonth(), 1),
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `TRX-${year}-${month}-${seq}`;
}

export async function logAudit({
  companyId,
  userId,
  action,
  entity,
  entityId,
  previousState,
  newState,
  ipAddress,
  userAgent,
}: {
  companyId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  previousState?: any;
  newState?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        previousState: previousState ? JSON.stringify(previousState) : null,
        newState: newState ? JSON.stringify(newState) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

