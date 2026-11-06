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
    | 'role'
    | 'transactionType';
  value: string;
  className?: string;
}

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
