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
  FileText,
  Search,
  Check,
  Building,
  MapPin,
  Calendar,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { formatDate, formatDateShort } from '@/lib/utils';
import { toast } from 'sonner';

interface CheckoutWizardProps {
  employees: any[];
  availableAssets: any[];
  preselectedEmployeeId?: string;
  preselectedAssetId?: string;
  currentUserName: string;
}

export function CheckoutWizard({
  employees,
  availableAssets,
  preselectedEmployeeId,
  preselectedAssetId,
  currentUserName,
}: CheckoutWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    preselectedEmployeeId || ''
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    preselectedAssetId ? [preselectedAssetId] : []
  );
  const [checkoutDate, setCheckoutDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [accessories, setAccessories] = useState(
    'Charger / Power Adaptor, Tas Laptop, Kabel Power'
  );
  const [notes, setNotes] = useState(
    'Fasilitas inventaris kerja resmi perusahaan. Diserahkan dalam kondisi baik dan siap pakai.'
  );
  const [issuerName, setIssuerName] = useState(currentUserName);
  const [issuerPosition, setIssuerPosition] = useState(
    'IT Asset & Infrastructure Lead'
  );

  // Search filters inside wizard
  const [empSearch, setEmpSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');

  // Submitting state & Success Dialog
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBast, setCreatedBast] = useState<{
    id: string;
    documentNumber: string;
  } | null>(null);

  // Selected Employee Details
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  // Selected Assets Details
  const selectedAssets = useMemo(
    () => availableAssets.filter((a) => selectedAssetIds.includes(a.id)),
    [availableAssets, selectedAssetIds]
  );

  // Filtered lists for wizard search
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

  const filteredAssets = useMemo(() => {
    if (!assetSearch) return availableAssets;
    const q = assetSearch.toLowerCase();
    return availableAssets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        (a.brand && a.brand.toLowerCase().includes(q)) ||
        (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
    );
  }, [availableAssets, assetSearch]);

  const toggleAssetSelection = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedEmployeeId) {
        toast.error('Pilih karyawan penerima terlebih dahulu');
        return;
      }
    } else if (currentStep === 2) {
      if (selectedAssetIds.length === 0) {
        toast.error('Pilih minimal satu aset yang akan diserahkan');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmCheckout = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          assetIds: selectedAssetIds,
          checkoutDate,
          expectedReturnDate: expectedReturnDate || null,
          condition,
          accessories,
          notes,
          issuerName,
          issuerPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses checkout aset');
      }

      toast.success(
        `Berhasil checkout! Dokumen ${data.documentNumber} diterbitkan.`
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
      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Pilih Karyawan' },
          { num: 2, label: 'Pilih Aset' },
          { num: 3, label: 'Detail Serah Terima' },
          { num: 4, label: 'Review & Terbitkan' },
        ].map((step) => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-xs'
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
              Langkah 1: Pilih Karyawan Penerima Aset
            </CardTitle>
            <CardDescription className="text-xs">
              Cari dan tentukan karyawan yang akan menerima tanggung jawab fisik aset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Ketik nama karyawan atau NIK..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs uppercase ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
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
                      <span className="text-[10px] text-slate-400 block">
                        Aset dipegang:
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {emp.assignments?.length || 0} unit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
            <Button
              onClick={handleNext}
              disabled={!selectedEmployeeId}
              className="gap-1.5"
            >
              Lanjutkan ke Pilih Aset
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: SELECT ASSETS */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Langkah 2: Pilih Aset yang Akan Diserahkan
                </CardTitle>
                <CardDescription className="text-xs">
                  Pilih satu atau lebih aset yang berstatus <strong>TERSEDIA (AVAILABLE)</strong>.
                </CardDescription>
              </div>
              <div className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {selectedAssetIds.length} Aset Dipilih
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari aset berdasarkan nama, nomor tag, merk, atau serial number..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isChecked = selectedAssetIds.includes(asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleAssetSelection(asset.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
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
                            {asset.category.name}
                            {asset.brand && ` • ${asset.brand}`}
                            {asset.serialNumber && ` (SN: ${asset.serialNumber})`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <StatusBadge
                          type="assetCondition"
                          value={asset.condition}
                        />
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {asset.location?.name || 'Gudang Utama'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada aset berstatus AVAILABLE yang ditemukan.
                </div>
              )}
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
              className="gap-1.5"
            >
              Lanjutkan ke Detail
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: DETAILS */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Langkah 3: Detail Serah Terima & Kondisi
            </CardTitle>
            <CardDescription className="text-xs">
              Lengkapi tanggal penyerahan, kelengkapan aksesoris, dan petugas yang menyerahkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkoutDate" className="text-xs">
                  Tanggal Serah Terima *
                </Label>
                <Input
                  id="checkoutDate"
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expectedReturn" className="text-xs">
                  Ekspektasi Pengembalian (Opsional)
                </Label>
                <Input
                  id="expectedReturn"
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                />
              </div>

              <div>
                <Select
                  label="Kondisi Fisik Saat Diserahkan"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="EXCELLENT">Sangat Baik (Mulus / Baru)</option>
                  <option value="GOOD">Baik (Normal / Layak)</option>
                  <option value="FAIR">Cukup (Sedikit Baret Halus)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="accessories" className="text-xs">
                  Daftar Aksesoris & Kelengkapan
                </Label>
                <Input
                  id="accessories"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Charger, Kabel, Tas, Mouse..."
                />
              </div>

              <div>
                <Label htmlFor="issuerName" className="text-xs">
                  Nama Petugas Penyerah (Pihak Pertama)
                </Label>
                <Input
                  id="issuerName"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="issuerPosition" className="text-xs">
                  Jabatan Petugas Penyerah
                </Label>
                <Input
                  id="issuerPosition"
                  value={issuerPosition}
                  onChange={(e) => setIssuerPosition(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="notes" className="text-xs">
                  Catatan Serah Terima / Ketentuan Penggunaan
                </Label>
                <textarea
                  id="notes"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={handlePrev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleNext} className="gap-1.5">
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
              Langkah 4: Konfirmasi Transaksi & Pembuatan BAST
            </CardTitle>
            <CardDescription className="text-xs">
              Tinjau kembali data penyerahan sebelum sistem mengunci aset dan menerbitkan BAST resmi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Employee Preview */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Penerima Aset (Pihak Kedua)
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase">
                  {selectedEmployee?.fullName.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {selectedEmployee?.fullName} ({selectedEmployee?.nik})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedEmployee?.position} • Departemen{' '}
                    {selectedEmployee?.department?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Assets List Preview */}
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Daftar Aset yang Diserahkan ({selectedAssets.length} Unit)
              </div>
              <div className="space-y-2">
                {selectedAssets.map((asset, idx) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-400 w-4">
                        {idx + 1}.
                      </span>
                      <div>
                        <span className="font-mono font-bold text-indigo-600 mr-2">
                          {asset.assetTag}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {asset.name}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          Brand: {asset.brand || '-'} • SN:{' '}
                          {asset.serialNumber || '-'}
                        </div>
                      </div>
                    </div>
                    <StatusBadge type="assetCondition" value={condition} />
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Tanggal Serah Terima
                </span>
                <span className="font-bold text-slate-800">
                  {formatDate(checkoutDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Aksesoris Diserahkan
                </span>
                <span className="font-medium text-slate-800">
                  {accessories || 'Lengkap'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Pihak Penyerah (Issuer)
                </span>
                <span className="font-semibold text-slate-800">
                  {issuerName} ({issuerPosition})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Status Pasca Checkout
                </span>
                <span className="font-bold text-indigo-600">
                  ASSIGNED (Dipinjamkan)
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
              onClick={handleConfirmCheckout}
              isLoading={isSubmitting}
              className="gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Konfirmasi & Terbitkan BAST
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* SUCCESS MODAL AFTER CHECKOUT */}
      <Dialog
        open={!!createdBast}
        onOpenChange={(open) => {
          if (!open) {
            router.push('/bast');
          }
        }}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              Penyerahan Aset Berhasil!
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Aset telah berhasil dialihkan ke karyawan dan Berita Acara Serah Terima (BAST)
              telah dibuat otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center my-2">
            <span className="text-[11px] text-emerald-800 block">
              Nomor Dokumen BAST Resmi:
            </span>
            <span className="font-mono text-base font-bold text-indigo-700 block mt-1">
              {createdBast?.documentNumber}
            </span>
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/assets')}
            >
              Kembali ke Daftar Aset
            </Button>
            <Button
              size="sm"
              asChild
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
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

