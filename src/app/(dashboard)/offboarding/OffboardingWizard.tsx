'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserX,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Check,
  Search,
  Box,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { formatDate, formatDateShort } from '@/lib/utils';
import { toast } from 'sonner';

interface OffboardingWizardProps {
  employees: any[];
  preselectedEmployeeId?: string;
  currentUserName: string;
}

export function OffboardingWizard({
  employees,
  preselectedEmployeeId,
  currentUserName,
}: OffboardingWizardProps) {
  const router = useRouter();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    preselectedEmployeeId || ''
  );
  const [terminationType, setTerminationType] = useState('RESIGNED');
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [returnedAssetIds, setReturnedAssetIds] = useState<string[]>([]);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [notes, setNotes] = useState('');
  const [issuerName, setIssuerName] = useState(currentUserName);
  const [issuerPosition, setIssuerPosition] = useState(
    'HR & IT Asset Clearance Specialist'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBast, setCreatedBast] = useState<{
    id: string;
    documentNumber: string;
    outstandingCount: number;
  } | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  const activeAssignments = useMemo(
    () => selectedEmployee?.assignments || [],
    [selectedEmployee]
  );

  // By default, select all assets when an employee is chosen
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp && emp.assignments) {
      setReturnedAssetIds(emp.assignments.map((a: any) => a.asset.id));
    } else {
      setReturnedAssetIds([]);
    }
  };

  const toggleReturnAsset = (assetId: string) => {
    setReturnedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const outstandingAssets = useMemo(() => {
    return activeAssignments.filter(
      (a: any) => !returnedAssetIds.includes(a.asset.id)
    );
  }, [activeAssignments, returnedAssetIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.error('Pilih karyawan yang akan di-offboard');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/offboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          terminationType,
          effectiveDate,
          returnedAssetIds,
          returnCondition,
          notes,
          issuerName,
          issuerPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses offboarding');
      }

      toast.success(
        `Offboarding berhasil diproses! Dokumen BAST ${data.documentNumber} diterbitkan.`
      );
      setCreatedBast({
        id: data.bastDocumentId,
        documentNumber: data.documentNumber,
        outstandingCount: data.outstandingCount || 0,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Penyelesaian Aset Karyawan Offboarding
              </CardTitle>
              <CardDescription className="text-xs">
                Periksa seluruh fasilitas kantor yang harus diserahkan kembali sebelum
                surat keterangan kerja & clearance diterbitkan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Employee Selection */}
            <div>
              <Select
                label="Pilih Karyawan yang Berhenti / Pensiun *"
                value={selectedEmployeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                required
              >
                <option value="">-- Pilih Karyawan --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.nik} - {emp.department.name}) •{' '}
                    {emp.assignments?.length || 0} Aset
                  </option>
                ))}
              </Select>
            </div>

            {selectedEmployee && (
              <>
                {/* Employee Details Banner */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nama & NIK</span>
                      <span className="font-bold text-slate-900">
                        {selectedEmployee.fullName} ({selectedEmployee.nik})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jabatan & Divisi</span>
                      <span className="font-semibold text-slate-800">
                        {selectedEmployee.position} • {selectedEmployee.department.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tgl Masuk Kerja</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(selectedEmployee.joinDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offboarding Type & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Jenis Terminasi Hubungan Kerja *"
                      value={terminationType}
                      onChange={(e) => setTerminationType(e.target.value)}
                      required
                    >
                      <option value="RETIRED">Pensiun (Purna Tugas)</option>
                      <option value="RESIGNED">Pengunduran Diri (Resign)</option>
                      <option value="CONTRACT_END">Kontrak Kerja Berakhir</option>
                      <option value="MUTATED">Mutasi Unit Eksternal</option>
                      <option value="TERMINATED">Terminasi Hubungan Kerja Lainnya</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="effectiveDate" className="text-xs">
                      Tanggal Efektif Berhenti (Last Day) *
                    </Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Asset Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-slate-800">
                      Checklist Pengembalian Aset ({activeAssignments.length} Unit Total)
                    </Label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          setReturnedAssetIds(
                            activeAssignments.map((a: any) => a.asset.id)
                          )
                        }
                        className="text-indigo-600 hover:underline"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setReturnedAssetIds([])}
                        className="text-slate-500 hover:underline"
                      >
                        Batalkan Semua
                      </button>
                    </div>
                  </div>

                  {activeAssignments.length > 0 ? (
                    <div className="space-y-2">
                      {activeAssignments.map((assign: any) => {
                        const asset = assign.asset;
                        const isReturned = returnedAssetIds.includes(asset.id);
                        return (
                          <div
                            key={asset.id}
                            onClick={() => toggleReturnAsset(asset.id)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isReturned
                                ? 'border-emerald-600 bg-emerald-50/30'
                                : 'border-amber-300 bg-amber-50/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                                  isReturned
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-amber-400 bg-white text-amber-600 font-bold'
                                }`}
                              >
                                {isReturned ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  '!'
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-indigo-600">
                                    {asset.assetTag}
                                  </span>
                                  <span className="font-semibold text-xs text-slate-900">
                                    {asset.name}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  {asset.category.name} • SN: {asset.serialNumber || '-'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                isReturned
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isReturned ? 'Dikembalikan' : 'Belum Dikembalikan'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                      Karyawan ini tidak memiliki aset aktif yang tercatat. BAST Clearance
                      dapat langsung diterbitkan.
                    </div>
                  )}
                </div>

                {/* Outstanding Assets Warning */}
                {outstandingAssets.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        Peringatan: Terdapat {outstandingAssets.length} Aset Belum Dikembalikan!
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Sistem tidak akan menghapus data assignment aset yang belum diserahkan.
                      Dokumen BAST akan mencatat sisa aset yang masih berstatus outstanding
                      sebagai dasar tindak lanjut ganti rugi atau penyelesaian HR.
                    </p>
                    <ul className="list-disc list-inside font-mono text-[11px] text-amber-800 pl-1">
                      {outstandingAssets.map((a: any) => (
                        <li key={a.id}>
                          [{a.asset.assetTag}] {a.asset.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Return condition & issuer details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Kondisi Fisik Aset yang Dikembalikan"
                      value={returnCondition}
                      onChange={(e) => setReturnCondition(e.target.value)}
                    >
                      <option value="EXCELLENT">Sangat Baik (Mulus)</option>
                      <option value="GOOD">Baik (Normal / Layak)</option>
                      <option value="FAIR">Cukup (Baret Pemakaian)</option>
                      <option value="DAMAGED">Rusak (Perlu Servis)</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="issuer" className="text-xs">
                      Petugas Clearance (HR / IT Asset)
                    </Label>
                    <Input
                      id="issuer"
                      value={issuerName}
                      onChange={(e) => setIssuerName(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="offbNotes" className="text-xs">
                      Catatan Berita Acara Offboarding
                    </Label>
                    <textarea
                      id="offbNotes"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Keterangan tambahan untuk Berita Acara penyelesaian..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/employees')}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedEmployeeId}
              isLoading={isSubmitting}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalisasi Offboarding & Terbitkan BAST
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Success Dialog */}
      <Dialog
        open={!!createdBast}
        onOpenChange={(open) => {
          if (!open) router.push('/bast');
        }}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              Offboarding Selesai & BAST Diterbitkan!
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Proses penyelesaian inventaris telah dicatat dan Berita Acara resmi telah
              dibuat.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-center my-2">
            <span className="text-[11px] text-indigo-700 block">
              Nomor Dokumen BAST:
            </span>
            <span className="font-mono text-base font-bold text-indigo-900 block mt-1">
              {createdBast?.documentNumber}
            </span>
            {createdBast && createdBast.outstandingCount > 0 && (
              <span className="inline-block mt-2 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Sisa Aset Outstanding: {createdBast.outstandingCount} unit
              </span>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/employees')}
            >
              Daftar Karyawan
            </Button>
            <Button
              size="sm"
              asChild
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            >
              <Link href={`/bast/${createdBast?.id}`}>
                <Printer className="h-4 w-4" />
                Lihat & Cetak Dokumen
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
