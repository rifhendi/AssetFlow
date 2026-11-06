import React from 'react';
import {
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  EMPLOYMENT_STATUSES,
  BAST_TYPES,
  ROLES,
  TRANSACTION_TYPES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  type:
    | 'assetStatus'
    | 'assetCondition'
    | 'employmentStatus'
    | 'bastType'
    | 'bastStatus'
    | 'role'
    | 'transactionType';
  value: string;
  className?: string;
}

const BAST_STATUSES: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'Diajukan', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  APPROVED: { label: 'Disetujui', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  FINAL: { label: 'Resmi/Final', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Ditolak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  let label = value;
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'assetStatus' && ASSET_STATUSES[value as keyof typeof ASSET_STATUSES]) {
    const item = ASSET_STATUSES[value as keyof typeof ASSET_STATUSES];
    label = item.label;
    color = item.color;
  } else if (
    type === 'assetCondition' &&
    ASSET_CONDITIONS[value as keyof typeof ASSET_CONDITIONS]
  ) {
    const item = ASSET_CONDITIONS[value as keyof typeof ASSET_CONDITIONS];
    label = item.label;
    color = item.color;
  } else if (
    type === 'employmentStatus' &&
    EMPLOYMENT_STATUSES[value as keyof typeof EMPLOYMENT_STATUSES]
  ) {
    const item = EMPLOYMENT_STATUSES[value as keyof typeof EMPLOYMENT_STATUSES];
    label = item.label;
    color = item.color;
  } else if (type === 'bastType' && BAST_TYPES[value as keyof typeof BAST_TYPES]) {
    const item = BAST_TYPES[value as keyof typeof BAST_TYPES];
    label = item.label;
    color = item.color;
  } else if (type === 'bastStatus' && BAST_STATUSES[value]) {
    const item = BAST_STATUSES[value];
    label = item.label;
    color = item.color;
  } else if (type === 'role' && ROLES[value as keyof typeof ROLES]) {
    const item = ROLES[value as keyof typeof ROLES];
    label = item.label;
    color = item.color;
  } else if (
    type === 'transactionType' &&
    TRANSACTION_TYPES[value as keyof typeof TRANSACTION_TYPES]
  ) {
    const item = TRANSACTION_TYPES[value as keyof typeof TRANSACTION_TYPES];
    label = item.label;
    color = item.color;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        color,
        className
      )}
    >
      {label}
    </span>
  );
}

