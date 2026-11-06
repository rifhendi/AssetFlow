export const APP_NAME = 'AssetFlow';
export const APP_DESCRIPTION = 'Enterprise Asset & Lifecycle Management System';

export const ROLES = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ADMIN_ASSET: { label: 'Admin Asset', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  HR_ADMIN: { label: 'HR Admin', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  EMPLOYEE: { label: 'Employee', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  AUDITOR: { label: 'Auditor', color: 'bg-amber-100 text-amber-800 border-amber-200' },
} as const;

export const ASSET_STATUSES = {
  AVAILABLE: { label: 'Tersedia (Available)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ASSIGNED: { label: 'Dipinjamkan (Assigned)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_USE: { label: 'Sedang Digunakan (In Use)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  MAINTENANCE: { label: 'Dalam Pemeliharaan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RETURNED: { label: 'Dikembalikan', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  RETIRED: { label: 'Pensiun (Retired)', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  LOST: { label: 'Hilang (Lost)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  DISPOSED: { label: 'Dihapuskan (Disposed)', color: 'bg-red-50 text-red-700 border-red-200' },
} as const;

export const ASSET_CONDITIONS = {
  EXCELLENT: { label: 'Sangat Baik (Excellent)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  GOOD: { label: 'Baik (Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  FAIR: { label: 'Cukup (Fair)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  POOR: { label: 'Kurang (Poor)', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  DAMAGED: { label: 'Rusak (Damaged)', color: 'text-red-700 bg-red-50 border-red-200' },
} as const;

export const EMPLOYMENT_STATUSES = {
  PERMANENT: { label: 'Tetap (Permanent)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CONTRACT: { label: 'Kontrak (Contract)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROBATION: { label: 'Probation', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  INTERN: { label: 'Magang (Intern)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  RESIGNED: { label: 'Resign', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  RETIRED: { label: 'Pensiun', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  MUTATED: { label: 'Mutasi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  TERMINATED: { label: 'Terminasi', color: 'bg-red-100 text-red-800 border-red-300' },
} as const;

export const BAST_TYPES = {
  PENYERAHAN: { label: 'BAST Penyerahan Aset', prefix: 'PEN', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENGEMBALIAN: { label: 'BAST Pengembalian Aset', prefix: 'RET', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENSIUN: { label: 'BAST Karyawan Pensiun', prefix: 'PENSIUN', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  NON_PENSIUN: { label: 'BAST Offboarding Non-Pensiun', prefix: 'OFFB', color: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const;

export const TRANSACTION_TYPES = {
  CHECKOUT: { label: 'Penyerahan (Checkout)', color: 'text-blue-700 bg-blue-50' },
  CHECKIN: { label: 'Pengembalian (Check-in)', color: 'text-emerald-700 bg-emerald-50' },
  TRANSFER: { label: 'Mutasi / Transfer', color: 'text-purple-700 bg-purple-50' },
  MAINTENANCE_IN: { label: 'Masuk Servis', color: 'text-amber-700 bg-amber-50' },
  MAINTENANCE_OUT: { label: 'Selesai Servis', color: 'text-teal-700 bg-teal-50' },
  RETIREMENT: { label: 'Purna Aset (Retirement)', color: 'text-slate-700 bg-slate-100' },
  DISPOSAL: { label: 'Pemusnahan (Disposal)', color: 'text-red-700 bg-red-50' },
  AUDIT_ADJUSTMENT: { label: 'Koreksi Audit', color: 'text-indigo-700 bg-indigo-50' },
} as const;
