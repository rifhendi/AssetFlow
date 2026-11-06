'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowRightLeft, CheckCircle2, Box, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface TransferClientViewProps {
  assets: any[];
  employees: any[];
  locations: any[];
  preselectedAssetId?: string;
}

export function TransferClientView({
  assets,
  employees,
  locations,
  preselectedAssetId,
}: TransferClientViewProps) {
  const router = useRouter();
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId || '');
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [notes, setNotes] = useState('Mutasi aset operasional kedinasan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId),
    [assets, selectedAssetId]
  );

  const currentHolder = selectedAsset?.assignments?.[0]?.employee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      toast.error('Pilih aset yang akan ditransfer');
      return;
    }
    if (!toEmployeeId && !toLocationId) {
      toast.error('Tentukan karyawan tujuan atau lokasi tujuan baru');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetId,
          toEmployeeId: toEmployeeId || null,
          toLocationId: toLocationId || null,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses transfer aset');

      toast.success('Transfer aset berhasil diproses!');
      router.push(`/assets/${selectedAssetId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Formulir Mutasi & Relokasi Aset</CardTitle>
          <CardDescription className="text-xs">
            Pindahkan pemegang hak guna aset atau pindahkan lokasi fisik gedung aset.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Select
                label="Pilih Aset yang Dimutasi *"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                required
              >
                <option value="">-- Pilih Aset --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name} ({a.category.name})
                  </option>
                ))}
              </Select>
            </div>

            {selectedAsset && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Pemegang Sekarang:</span>
                  <span className="font-bold text-slate-800">
                    {currentHolder
                      ? `${currentHolder.fullName} (${currentHolder.nik})`
                      : 'Tersedia di Inventaris'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Lokasi Sekarang:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAsset.location?.name || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Kondisi Aset:</span>
                  <StatusBadge type="assetCondition" value={selectedAsset.condition} />
                </div>
              </div>
            )}

            <div>
              <Select
                label="Transfer ke Karyawan Baru (Opsional)"
                value={toEmployeeId}
                onChange={(e) => setToEmployeeId(e.target.value)}
              >
                <option value="">-- Tetap / Tidak dialihkan ke karyawan lain --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.nik} - {emp.department.name})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Relokasi ke Gedung / Ruangan Baru (Opsional)"
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
              >
                <option value="">-- Tetap / Lokasi tidak berubah --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.building ? `(${loc.building})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="transferNotes" className="text-xs">
                Catatan Mutasi
              </Label>
              <textarea
                id="transferNotes"
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="gap-1.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Proses Mutasi Aset
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
