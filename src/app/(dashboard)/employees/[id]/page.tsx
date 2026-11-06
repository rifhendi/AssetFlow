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
import { formatDate, formatDateShort, formatDateTime, formatCurrency } from '@/lib/utils';
import {
  User,
  Box,
  ArrowRightLeft,
  Calendar,
  Building,
  MapPin,
  Mail,
  Phone,
  FileText,
  UserX,
  History,
  CheckCircle2,
} from 'lucide-react';

interface EmployeeDetailPageProps {
  params: { id: string };
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const user = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { id: params.id, companyId: user.companyId },
    include: {
      department: true,
      location: true,
      assignments: {
        orderBy: { checkoutDate: 'desc' },
        include: {
          asset: {
            include: { category: true, location: true },
          },
          checkoutBast: true,
          returnBast: true,
        },
      },
      bastDocuments: {
        orderBy: { date: 'desc' },
        include: {
          items: true,
        },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  const activeAssignments = employee.assignments.filter((a) => a.status === 'ACTIVE');
  const pastAssignments = employee.assignments.filter((a) => a.status !== 'ACTIVE');

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.fullName}
        description={`NIK: ${employee.nik} • ${employee.position} (${employee.department.name})`}
        breadcrumbs={[
          { label: 'Employee Management', href: '/employees' },
          { label: 'Employee List', href: '/employees' },
          { label: employee.fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 shadow-xs">
              <Link href={`/transactions/checkout?employeeId=${employee.id}`}>
                <ArrowRightLeft className="h-4 w-4" />
                Checkout Aset
              </Link>
            </Button>
            {activeAssignments.length > 0 && (
              <Button asChild size="sm" variant="outline" className="gap-1.5 shadow-xs">
                <Link href={`/transactions/checkin?employeeId=${employee.id}`}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Kembalikan Aset
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-1.5 shadow-xs text-amber-700 hover:text-amber-800">
              <Link href={`/offboarding?employeeId=${employee.id}`}>
                <UserX className="h-4 w-4 text-amber-600" />
                Offboarding
              </Link>
            </Button>
          </div>
        }
      />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0 font-bold text-sm">
            {employee.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Status Kepegawaian</div>
            <div className="mt-1">
              <StatusBadge type="employmentStatus" value={employee.employmentStatus} />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Aset Sedang Dipinjam</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {activeAssignments.length} unit
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400">Divisi Departemen</div>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {employee.department.name}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400">Lokasi Kerja</div>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {employee.location ? employee.location.name : '-'}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assigned">
            Aset Aktif ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="history">Riwayat Aset</TabsTrigger>
          <TabsTrigger value="documents">
            Dokumen BAST ({employee.bastDocuments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Informasi Lengkap Pegawai
              </CardTitle>
              <CardDescription className="text-xs">
                Data administrasi HR dan kontak resmi karyawan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Nomor Induk Karyawan (NIK)</dt>
                  <dd className="font-mono font-bold text-indigo-600 mt-0.5 text-sm">
                    {employee.nik}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Nama Lengkap</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">
                    {employee.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Email Perusahaan</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{employee.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Nomor Telepon / WA</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">
                    {employee.phone || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Departemen</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">
                    {employee.department.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Jabatan</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">
                    {employee.position}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Tanggal Bergabung</dt>
                  <dd className="text-slate-800 mt-0.5">{formatDate(employee.joinDate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Status Akun</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {employee.isActive ? (
                      <span className="text-emerald-600 font-semibold">Aktif</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Nonaktif</span>
                    )}
                  </dd>
                </div>
              </dl>

              {employee.notes && (
                <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Catatan Internal:
                  </span>
                  <p className="text-slate-600">{employee.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Assigned Assets */}
        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Aset Inventaris yang Sedang Dipegang
                </CardTitle>
                <CardDescription className="text-xs">
                  Daftar seluruh fasilitas kerja yang menjadi tanggung jawab karyawan saat ini
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/transactions/checkout?employeeId=${employee.id}`}>
                  Checkout Aset Tambahan
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeAssignments.length > 0 ? (
                <div className="space-y-3">
                  {activeAssignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 gap-4 hover:border-indigo-200 transition-all shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                          <Box className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-600">
                              {assign.asset.assetTag}
                            </span>
                            <StatusBadge
                              type="assetCondition"
                              value={assign.checkoutCondition}
                            />
                          </div>
                          <Link
                            href={`/assets/${assign.asset.id}`}
                            className="text-xs font-bold text-slate-900 hover:underline block mt-0.5 truncate"
                          >
                            {assign.asset.name}
                          </Link>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {assign.asset.brand || ''} • SN:{' '}
                            {assign.asset.serialNumber || '-'} • Checkout:{' '}
                            {formatDateShort(assign.checkoutDate)}
                          </div>
                          {assign.accessories && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              Aksesoris: {assign.accessories}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {assign.checkoutBast && (
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                            <Link href={`/bast/${assign.checkoutBast.id}`}>
                              Lihat BAST
                            </Link>
                          </Button>
                        )}
                        <Button asChild size="sm" variant="default" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                          <Link href={`/transactions/checkin?assetId=${assign.asset.id}&employeeId=${employee.id}`}>
                            Kembalikan
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Karyawan ini tidak sedang memegang aset inventaris apapun.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Riwayat Penyerahan & Pengembalian Aset
              </CardTitle>
              <CardDescription className="text-xs">
                Semua aset yang pernah diserahkan atau dikembalikan oleh karyawan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employee.assignments.length > 0 ? (
                <div className="space-y-3">
                  {employee.assignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            assign.status === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <div>
                          <Link
                            href={`/assets/${assign.asset.id}`}
                            className="font-bold text-slate-900 hover:underline"
                          >
                            {assign.asset.name}{' '}
                            <span className="font-mono text-indigo-600">
                              ({assign.asset.assetTag})
                            </span>
                          </Link>
                          <div className="text-[11px] text-slate-500">
                            Checkout: {formatDateShort(assign.checkoutDate)}
                            {assign.actualReturnDate &&
                              ` • Kembali: ${formatDateShort(assign.actualReturnDate)}`}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Status: {assign.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada riwayat mutasi aset untuk karyawan ini.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Dokumen BAST Terkait Karyawan
              </CardTitle>
              <CardDescription className="text-xs">
                Semua Berita Acara Serah Terima (Penyerahan, Pengembalian, Offboarding)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employee.bastDocuments.length > 0 ? (
                <div className="space-y-3">
                  {employee.bastDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge type="bastType" value={doc.type} />
                        <div>
                          <Link
                            href={`/bast/${doc.id}`}
                            className="font-mono font-bold text-indigo-600 hover:underline block"
                          >
                            {doc.documentNumber}
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {doc.title} • {formatDateShort(doc.date)}
                          </span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link href={`/bast/${doc.id}`}>Buka Dokumen</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada arsip dokumen BAST untuk karyawan ini.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

