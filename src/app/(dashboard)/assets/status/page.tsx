import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ASSET_STATUSES } from '@/lib/constants';
import {
  CheckCircle2,
  ArrowRightLeft,
  Wrench,
  Archive,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default async function AssetStatusPage() {
  const user = await requireAuth();

  const statuses = [
    'AVAILABLE',
    'ASSIGNED',
    'IN_USE',
    'MAINTENANCE',
    'RETURNED',
    'RETIRED',
    'LOST',
    'DISPOSED',
  ];

  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.asset.count({
        where: { companyId: user.companyId, status: status as any },
      })
    )
  );

  const statusMap = statuses.map((status, index) => ({
    status,
    count: counts[index],
    meta: ASSET_STATUSES[status as keyof typeof ASSET_STATUSES],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siklus Hidup & Status Aset"
        description="Alur siklus hidup inventaris dari pengadaan awal, penyerahan kepada karyawan, pemeliharaan berkala, hingga purna aset."
        breadcrumbs={[
          { label: 'Asset Management', href: '/assets' },
          { label: 'Asset Status Lifecycle' },
        ]}
      />

      {/* Lifecycle Flow Visual Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50 border-indigo-100">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Alur Siklus Hidup Aset (Lifecycle Pipeline)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Setiap status merepresentasikan tahapan kepemilikan dan kewajiban hukum inventaris
          perusahaan.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <div>
              <span className="font-bold text-slate-800 block">1. Available</span>
              <span className="text-[10px] text-slate-400">Siap di-checkout</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <div>
              <span className="font-bold text-slate-800 block">2. Assigned</span>
              <span className="text-[10px] text-slate-400">Pegang oleh staf</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <div>
              <span className="font-bold text-slate-800 block">3. Maintenance</span>
              <span className="text-[10px] text-slate-400">Servis & perbaikan</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-cyan-200 shadow-2xs">
            <span className="h-3 w-3 rounded-full bg-cyan-500" />
            <div>
              <span className="font-bold text-slate-800 block">4. Returned</span>
              <span className="text-[10px] text-slate-400">Kembali ke gudang</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-300 shadow-2xs">
            <span className="h-3 w-3 rounded-full bg-slate-500" />
            <div>
              <span className="font-bold text-slate-800 block">5. Retired / Disposed</span>
              <span className="text-[10px] text-slate-400">Purna tugas / musnah</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid of All Statuses with counts and links to filtered assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusMap.map(({ status, count, meta }) => (
          <Link
            key={status}
            href={`/assets?status=${status}`}
            className="group block"
          >
            <Card className="h-full group-hover:border-indigo-300 transition-all shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <StatusBadge type="assetStatus" value={status} />
                <span className="font-mono text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {count}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  {status === 'AVAILABLE' && 'Aset berada di gudang inventaris dan siap diserahkan kepada karyawan.'}
                  {status === 'ASSIGNED' && 'Aset resmi diserahkan kepada staf dengan dokumen BAST sah.'}
                  {status === 'IN_USE' && 'Perangkat infrastruktur atau operasional bersama sedang aktif dipakai.'}
                  {status === 'MAINTENANCE' && 'Perangkat sedang dalam penanganan teknis servis atau garansi vendor.'}
                  {status === 'RETURNED' && 'Aset telah dikembalikan karyawan dan sedang dalam pengecekan QC.'}
                  {status === 'RETIRED' && 'Aset telah habis masa manfaat ekonomis dan purna tugas.'}
                  {status === 'LOST' && 'Aset dilaporkan hilang dan dalam proses investigasi pertanggungjawaban.'}
                  {status === 'DISPOSED' && 'Aset telah dimusnahkan atau dilelang secara resmi dari pembukuan.'}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:underline">
                  Filter aset berstatus ini &rarr;
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

