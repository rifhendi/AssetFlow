import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatDateTime,
} from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  User,
  ArrowRightLeft,
  Calendar,
  Building,
  MapPin,
  ShieldCheck,
  Wrench,
  FileText,
  Clock,
  Printer,
  Edit,
  Tag,
} from 'lucide-react';

interface AssetDetailPageProps {
  params: { id: string };
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const user = await requireAuth();

  const asset = await prisma.asset.findUnique({
    where: { id: params.id, companyId: user.companyId },
    include: {
      category: true,
      location: true,
      department: true,
      assignments: {
        orderBy: { checkoutDate: 'desc' },
        include: {
          employee: {
            include: { department: true, location: true },
          },
          checkoutBast: true,
          returnBast: true,
        },
      },
      transactions: {
        orderBy: { date: 'desc' },
        include: {
          fromEmployee: true,
          toEmployee: true,
          fromLocation: true,
          toLocation: true,
          performedBy: true,
          bastDocument: true,
        },
      },
      maintenances: {
        orderBy: { startDate: 'desc' },
      },
      bastItems: {
        include: {
          bastDocument: true,
        },
      },
    },
  });

  if (!asset) {
    notFound();
  }

  const activeAssignment = asset.assignments.find((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons */}
      <PageHeader
        title={`${asset.name}`}
        description={`Nomor Tag: ${asset.assetTag} • Kategori: ${asset.category.name}`}
        breadcrumbs={[
          { label: 'Asset Management', href: '/assets' },
          { label: 'All Assets', href: '/assets' },
          { label: asset.assetTag },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {asset.status === 'AVAILABLE' && (
              <Button asChild size="sm" className="gap-1.5 shadow-xs">
                <Link href={`/transactions/checkout?assetId=${asset.id}`}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Checkout ke Karyawan
                </Link>
              </Button>
            )}
            {asset.status === 'ASSIGNED' && (
              <Button asChild size="sm" variant="default" className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/transactions/checkin?assetId=${asset.id}`}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Kembalikan (Return)
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-1.5 shadow-xs">
              <Link href={`/transactions/transfer?assetId=${asset.id}`}>
                <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                Transfer Aset
              </Link>
            </Button>
          </div>
        }
      />

      {/* Top Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">
              Status Ketersediaan
            </div>
            <div className="mt-1">
              <StatusBadge type="assetStatus" value={asset.status} />
            </div>
          </div>
        </Card>

        {/* Condition Card */}
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">
              Kondisi Fisik
            </div>
            <div className="mt-1">
              <StatusBadge type="assetCondition" value={asset.condition} />
            </div>
          </div>
        </Card>

        {/* Current Holder */}
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400">
              Pemegang Saat Ini
            </div>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {activeAssignment ? (
                <Link
                  href={`/employees/${activeAssignment.employee.id}`}
                  className="hover:underline text-indigo-600"
                >
                  {activeAssignment.employee.fullName}
                </Link>
              ) : (
                <span className="text-slate-400 font-normal italic">
                  Tersedia di Inventaris
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Location Card */}
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400">Lokasi Penempatan</div>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {asset.location ? asset.location.name : '-'}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl">
          <TabsTrigger value="overview">Spesifikasi</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Mutasi</TabsTrigger>
          <TabsTrigger value="maintenance">Pemeliharaan</TabsTrigger>
          <TabsTrigger value="documents">Dokumen BAST</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Specs */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Spesifikasi Teknis & Data Pengadaan
                </CardTitle>
                <CardDescription className="text-xs">
                  Detail nomor seri, brand, tanggal pembelian, dan garansi resmi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  <div>
                    <dt className="text-slate-400 font-medium">Nomor Asset Tag</dt>
                    <dd className="font-mono font-bold text-indigo-600 mt-0.5 text-sm">
                      {asset.assetTag}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Kategori</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {asset.category.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Brand / Merk</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {asset.brand || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Model / Tipe</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {asset.model || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Serial Number (S/N)</dt>
                    <dd className="font-mono text-slate-800 mt-0.5">
                      {asset.serialNumber || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Harga Pembelian</dt>
                    <dd className="font-bold text-slate-900 mt-0.5">
                      {formatCurrency(asset.purchasePrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Tanggal Pengadaan</dt>
                    <dd className="text-slate-800 mt-0.5">
                      {formatDate(asset.purchaseDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Garansi Berakhir</dt>
                    <dd className="text-slate-800 mt-0.5">
                      {formatDate(asset.warrantyExpDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Departemen Penanggung Jawab</dt>
                    <dd className="text-slate-800 mt-0.5">
                      {asset.department ? asset.department.name : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-medium">Lokasi Kantor & Ruangan</dt>
                    <dd className="text-slate-800 mt-0.5">
                      {asset.location
                        ? `${asset.location.name} (${asset.location.floor || ''})`
                        : '-'}
                    </dd>
                  </div>
                </dl>

                {asset.notes && (
                  <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Catatan Inventaris:
                    </span>
                    <p className="text-slate-600">{asset.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Code & Label Box */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  QR Code & Label Fisik
                </CardTitle>
                <CardDescription className="text-xs">
                  Barcode resmi untuk stiker aset inventaris
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <QRCodeSVG
                    value={
                      asset.qrCode ||
                      `ASSETFLOW:${asset.assetTag}:${asset.serialNumber || ''}`
                    }
                    size={160}
                    level="H"
                  />
                </div>
                <div className="mt-3">
                  <span className="font-mono font-bold text-indigo-600 text-sm block">
                    {asset.assetTag}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    {asset.serialNumber || 'SN: -'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full gap-2 text-xs"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Stiker Label
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Current Assignment */}
        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Status Pemegang Saat Ini
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi detail peminjam aktif perangkat dan data serah terima
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAssignment ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm uppercase">
                        {activeAssignment.employee.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {activeAssignment.employee.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          NIK: {activeAssignment.employee.nik} •{' '}
                          {activeAssignment.employee.position}
                        </p>
                        <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                          Departemen:{' '}
                          {activeAssignment.employee.department?.name || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link href={`/employees/${activeAssignment.employee.id}`}>
                          Lihat Profil Karyawan
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/transactions/checkin?assetId=${asset.id}`}>
                          Kembalikan Aset
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <dt className="text-slate-400 font-medium">Tanggal Checkout</dt>
                      <dd className="font-semibold text-slate-800 mt-1">
                        {formatDate(activeAssignment.checkoutDate)}
                      </dd>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <dt className="text-slate-400 font-medium">Kondisi Saat Checkout</dt>
                      <dd className="mt-1">
                        <StatusBadge
                          type="assetCondition"
                          value={activeAssignment.checkoutCondition}
                        />
                      </dd>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <dt className="text-slate-400 font-medium">Kelengkapan Aksesoris</dt>
                      <dd className="font-semibold text-slate-800 mt-1">
                        {activeAssignment.accessories || 'Lengkap'}
                      </dd>
                    </div>
                  </dl>

                  {activeAssignment.checkoutBast && (
                    <div className="rounded-lg border border-slate-200 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span>
                          Dokumen BAST Penyerahan:{' '}
                          <strong className="font-mono text-indigo-600">
                            {activeAssignment.checkoutBast.documentNumber}
                          </strong>
                        </span>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link href={`/bast/${activeAssignment.checkoutBast.id}`}>
                          Buka BAST
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Aset saat ini berstatus <strong>TERSEDIA (AVAILABLE)</strong> dan belum
                  diserahkan kepada karyawan manapun.
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href={`/transactions/checkout?assetId=${asset.id}`}>
                        Lakukan Checkout Sekarang
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Timeline & Transactions */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Riwayat Perpindahan & Jejak Audit Aset
              </CardTitle>
              <CardDescription className="text-xs">
                Log kronologis seluruh mutasi, checkout, pengembalian, dan servis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asset.transactions.length > 0 ? (
                <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-6">
                  {asset.transactions.map((trx, idx) => (
                    <div key={trx.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white ring-4 ring-white shadow-xs">
                        <Clock className="h-2.5 w-2.5" />
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge type="transactionType" value={trx.type} />
                            <span className="font-mono text-[11px] font-semibold text-slate-500">
                              {trx.transactionNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatDateTime(trx.date)}
                          </span>
                        </div>

                        <p className="text-slate-700 font-medium">
                          {trx.toEmployee && (
                            <span>
                              Diserahkan kepada:{' '}
                              <strong>{trx.toEmployee.fullName}</strong> ({trx.toEmployee.nik})
                            </span>
                          )}
                          {trx.fromEmployee && (
                            <span>
                              Dikembalikan oleh:{' '}
                              <strong>{trx.fromEmployee.fullName}</strong> ({trx.fromEmployee.nik})
                            </span>
                          )}
                        </p>

                        {trx.notes && (
                          <p className="text-slate-500 text-[11px]">
                            Catatan: {trx.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>
                            Petugas: {trx.performedBy?.name || 'Sistem Otomatis'}
                          </span>
                          {trx.bastDocument && (
                            <Link
                              href={`/bast/${trx.bastDocument.id}`}
                              className="text-indigo-600 hover:underline font-mono"
                            >
                              BAST: {trx.bastDocument.documentNumber}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada log transaksi untuk aset ini
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Maintenance */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Riwayat Pemeliharaan & Servis
                </CardTitle>
                <CardDescription className="text-xs">
                  Pencatatan perbaikan, penggantian suku cadang, dan biaya servis
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {asset.maintenances.length > 0 ? (
                <div className="space-y-3">
                  {asset.maintenances.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{m.title}</span>
                        <span className="font-bold text-indigo-600">
                          {formatCurrency(m.cost)}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{m.description}</p>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-4">
                        <span>Vendor: {m.vendor || '-'}</span>
                        <span>Mulai: {formatDateShort(m.startDate)}</span>
                        <span>Selesai: {formatDateShort(m.endDate)}</span>
                        <span>Status: {m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada catatan perbaikan atau servis untuk perangkat ini.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Dokumen BAST Terkait
              </CardTitle>
              <CardDescription className="text-xs">
                Arsip berita acara serah terima resmi yang memuat aset ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asset.bastItems.length > 0 ? (
                <div className="space-y-3">
                  {asset.bastItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          type="bastType"
                          value={item.bastDocument.type}
                        />
                        <div>
                          <Link
                            href={`/bast/${item.bastDocument.id}`}
                            className="font-mono font-bold text-indigo-600 hover:underline block"
                          >
                            {item.bastDocument.documentNumber}
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {item.bastDocument.title} • Penerima:{' '}
                            {item.bastDocument.recipientName}
                          </span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link href={`/bast/${item.bastDocument.id}`}>
                          Buka & Cetak BAST
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada dokumen BAST resmi untuk aset ini.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

