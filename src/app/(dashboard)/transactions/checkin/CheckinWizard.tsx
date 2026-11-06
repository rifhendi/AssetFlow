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
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Box,
  Check,
  Search,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatDateShort } from '@/lib/utils';
import { toast } from 'sonner';

interface CheckinWizardProps {
  employees: any[];
  preselectedEmployeeId?: string;
  preselectedAssetId?: string;
  currentUserName: string;
}

export function CheckinWizard({
  employees,
  preselectedEmployeeId,
  preselectedAssetId,
  currentUserName,
}: CheckinWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    preselectedEmployeeId || ''
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    preselectedAssetId ? [preselectedAssetId] : []
  );
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [accessories, setAccessories] = useState('Lengkap');
  const [returnNotes, setReturnNotes] = useState(
    'Aset inventaris dikembalikan dalam kondisi baik dan kelengkapan lengkap sesuai catatan serah terima.'
  );
  const [receiverName, setReceiverName] = useState(currentUserName);
  const [receiverPosition, setReceiverPosition] = useState(
    'IT Asset & Infrastructure Lead'
  );

  const [empSearch, setEmpSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBast, setCreatedBast] = useState<{
    id: string;
    documentNumber: string;
  } | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  const availableAssignments = useMemo(
    () => selectedEmployee?.assignments || [],
    [selectedEmployee]
  );

  const selectedAssets = useMemo(() => {
    return availableAssignments
      .filter((a: any) => selectedAssetIds.includes(a.asset.id))
      .map((a: any) => a.asset);
  }, [availableAssignments, selectedAssetIds]);

  const filteredEmployees = useMemo(() => {
    if (!empSearch) return employees;
    const q = empSearch.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.nik.toLowerCase().includes(q) ||
        e.department?.name.toLowerCase().includes(q)
    );
  }, [employees, empSearch]);

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedEmployeeId) {
      toast.error('Pilih karyawan yang mengembalikan aset');
      return;
    }
    if (currentStep === 2 && selectedAssetIds.length === 0) {
      toast.error('Pilih minimal satu aset yang dikembalikan');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmReturn = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          assetIds: selectedAssetIds,
          returnDate,
          returnCondition,
          returnNotes,
          accessories,
          receiverName,
          receiverPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pengembalian aset');
      }

      toast.success(
        `Berhasil mengembalikan aset! BAST Pengembalian ${data.documentNumber} diterbitkan.`
      );
      setCreatedBast({
        id: data.bastDocumentId,
        documentNumber: data.documentNumber,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Pilih Karyawan' },
          { num: 2, label: 'Pilih Aset Dikembalikan' },
          { num: 3, label: 'Kondisi Pengembalian' },
          { num: 4, label: 'Konfirmasi & BAST' },
        ].map((step) => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-xs'
                  : currentStep > step.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {currentStep > step.num ? (
                <Check className="h-4 w-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                currentStep === step.num
                  ? 'font-bold text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: SELECT EMPLOYEE */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Langkah 1: Pilih Karyawan yang Mengembalikan Aset
            </CardTitle>
            <CardDescription className="text-xs">
              Menampilkan hanya karyawan yang saat ini memegang aset inventaris aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari karyawan atau NIK..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setSelectedAssetIds([]);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs uppercase ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {emp.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {emp.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-indigo-600 font-semibold">
                              {emp.nik}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {emp.position} • {emp.department?.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {emp.assignments?.length || 0} Aset Dipegang
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada karyawan yang sedang memegang aset aktif saat ini.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
            <Button
              onClick={handleNext}
              disabled={!selectedEmployeeId}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              Lanjutkan Pilih Aset
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: SELECT ASSETS BEING RETURNED */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Langkah 2: Pilih Aset yang Dikembalikan
                </CardTitle>
                <CardDescription className="text-xs">
                  Karyawan: <strong>{selectedEmployee?.fullName}</strong> ({selectedEmployee?.nik})
                </CardDescription>
              </div>
              <div className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {selectedAssetIds.length} Aset Dipilih
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {availableAssignments.map((assign: any) => {
                const asset = assign.asset;
                const isChecked = selectedAssetIds.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleAsset(asset.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
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
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Checkout: {formatDateShort(assign.checkoutDate)} • Kondisi awal:{' '}
                          {assign.checkoutCondition}
                        </div>
                      </div>
                    </div>
                    <StatusBadge type="assetCondition" value={asset.condition} />
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={handlePrev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAssetIds.length === 0}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              Lanjutkan ke Kondisi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: RETURN DETAILS & INSPECTION */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Langkah 3: Pengecekan Kondisi Fisik & Kelengkapan
            </CardTitle>
            <CardDescription className="text-xs">
              Catat hasil inspeksi saat perangkat diserahkan kembali ke gudang perusahaan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="returnDate" className="text-xs">
                  Tanggal Pengembalian *
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Select
                  label="Kondisi Fisik Saat Kembali *"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  <option value="EXCELLENT">Sangat Baik (Mulus / Seperti Baru)</option>
                  <option value="GOOD">Baik (Normal / Layak)</option>
                  <option value="FAIR">Cukup (Baret Pemakaian)</option>
                  <option value="POOR">Kurang (Perlu Perawatan)</option>
                  <option value="DAMAGED">Rusak (Perlu Masuk Servis)</option>
                </Select>
              </div>

              {returnCondition === 'DAMAGED' && (
                <div className="sm:col-span-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Status aset otomatis akan diubah menjadi <strong>MAINTENANCE</strong> karena
                    kondisi pengembalian ditandai Rusak.
                  </span>
                </div>
              )}

              <div>
                <Label htmlFor="accReturn" className="text-xs">
                  Kelengkapan Aksesoris yang Dikembalikan
                </Label>
                <Input
                  id="accReturn"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Charger, kabel, tas, mouse..."
                />
              </div>

              <div>
                <Label htmlFor="receiverName" className="text-xs">
                  Petugas Penerima (IT / Aset)
                </Label>
                <Input
                  id="receiverName"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="retNotes" className="text-xs">
                  Catatan Pengembalian
                </Label>
                <textarea
                  id="retNotes"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={handlePrev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleNext} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              Review Ringkasan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Langkah 4: Konfirmasi Pengembalian & Terbitkan BAST
            </CardTitle>
            <CardDescription className="text-xs">
              Tinjau kembali berita acara sebelum assignment ditutup permanen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Karyawan Pengembali
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase">
                  {selectedEmployee?.fullName.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {selectedEmployee?.fullName} ({selectedEmployee?.nik})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedEmployee?.position} • {selectedEmployee?.department?.name}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Daftar Aset yang Dikembalikan ({selectedAssets.length} Unit)
              </div>
              <div className="space-y-2">
                {selectedAssets.map((asset: any, idx: number) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white text-xs shadow-2xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-600 mr-2">
                        {asset.assetTag}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {asset.name}
                      </span>
                    </div>
                    <StatusBadge type="assetCondition" value={returnCondition} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Kembali</span>
                <span className="font-bold text-slate-800">{formatDate(returnDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Kondisi Saat Kembali</span>
                <span className="font-bold text-slate-800">{returnCondition}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Petugas Penerima</span>
                <span className="font-semibold text-slate-800">{receiverName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status Pasca Kembali</span>
                <span className="font-bold text-emerald-600">
                  {returnCondition === 'DAMAGED' ? 'MAINTENANCE (Servis)' : 'AVAILABLE (Tersedia)'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button
              onClick={handleConfirmReturn}
              isLoading={isSubmitting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Konfirmasi & Terbitkan BAST Pengembalian
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* SUCCESS MODAL */}
      <Dialog
        open={!!createdBast}
        onOpenChange={(open) => {
          if (!open) router.push('/bast');
        }}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              Pengembalian Aset Berhasil!
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Aset telah diterima kembali di gudang inventaris dan BAST Pengembalian telah
              diterbitkan secara sah.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center my-2">
            <span className="text-[11px] text-emerald-800 block">
              Nomor BAST Pengembalian:
            </span>
            <span className="font-mono text-base font-bold text-emerald-700 block mt-1">
              {createdBast?.documentNumber}
            </span>
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/assets')}
            >
              Daftar Aset
            </Button>
            <Button
              size="sm"
              asChild
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <Link href={`/bast/${createdBast?.id}`}>
                <Printer className="h-4 w-4" />
                Lihat & Cetak BAST
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
