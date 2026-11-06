'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  asset?: any | null;
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function AssetFormModal({
  open,
  onOpenChange,
  onSuccess,
  asset,
  categories,
  locations,
  departments,
}: AssetFormModalProps) {
  const isEditing = !!asset;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpDate: '',
    locationId: '',
    departmentId: '',
    condition: 'GOOD',
    status: 'AVAILABLE',
    notes: '',
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        categoryId: asset.categoryId || (categories[0]?.id || ''),
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate
          ? new Date(asset.purchaseDate).toISOString().slice(0, 10)
          : '',
        purchasePrice: asset.purchasePrice ? String(asset.purchasePrice) : '',
        warrantyExpDate: asset.warrantyExpDate
          ? new Date(asset.warrantyExpDate).toISOString().slice(0, 10)
          : '',
        locationId: asset.locationId || '',
        departmentId: asset.departmentId || '',
        condition: asset.condition || 'GOOD',
        status: asset.status || 'AVAILABLE',
        notes: asset.notes || '',
      });
    } else {
      setFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpDate: '',
        locationId: locations[0]?.id || '',
        departmentId: departments[0]?.id || '',
        condition: 'GOOD',
        status: 'AVAILABLE',
        notes: '',
      });
    }
  }, [asset, categories, locations, departments, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama aset wajib diisi');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Kategori wajib dipilih');
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/assets/${asset.id}` : '/api/assets';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan aset');
      }

      toast.success(
        isEditing
          ? 'Data aset berhasil diperbarui!'
          : `Aset ${data.assetTag} berhasil ditambahkan!`
      );
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Aset: ${asset.assetTag}` : 'Tambah Aset Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Perbarui spesifikasi atau status fisik perangkat inventaris.'
              : 'Daftarkan perangkat baru ke dalam basis data inventaris perusahaan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="text-xs">
                Nama Aset *
              </Label>
              <Input
                id="name"
                required
                placeholder="Contoh: MacBook Pro 14 M3 Pro"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Select
                label="Kategori Aset *"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="brand" className="text-xs">
                Brand / Merk
              </Label>
              <Input
                id="brand"
                placeholder="Contoh: Apple, Lenovo, Dell"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="model" className="text-xs">
                Model / Tipe
              </Label>
              <Input
                id="model"
                placeholder="Contoh: ThinkPad X1 Carbon Gen 11"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="serialNumber" className="text-xs">
                Serial Number (S/N)
              </Label>
              <Input
                id="serialNumber"
                placeholder="Contoh: C02GK998MD6T"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice" className="text-xs">
                Harga Pembelian (Rp)
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="Contoh: 25000000"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate" className="text-xs">
                Tanggal Pembelian
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
              />
            </div>

            <div>
              <Select
                label="Lokasi Aset"
                value={formData.locationId}
                onChange={(e) =>
                  setFormData({ ...formData, locationId: e.target.value })
                }
              >
                <option value="">Pilih Lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Departemen Pemilik"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
              >
                <option value="">Pilih Departemen</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Kondisi Fisik"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
              >
                <option value="EXCELLENT">Sangat Baik (Excellent)</option>
                <option value="GOOD">Baik (Good)</option>
                <option value="FAIR">Cukup (Fair)</option>
                <option value="POOR">Kurang (Poor)</option>
                <option value="DAMAGED">Rusak (Damaged)</option>
              </Select>
            </div>

            <div>
              <Select
                label="Status Ketersediaan"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="AVAILABLE">Tersedia (Available)</option>
                <option value="ASSIGNED">Dipinjamkan (Assigned)</option>
                <option value="IN_USE">Sedang Digunakan (In Use)</option>
                <option value="MAINTENANCE">Dalam Servis (Maintenance)</option>
                <option value="RETIRED">Purna Aset (Retired)</option>
                <option value="LOST">Hilang (Lost)</option>
                <option value="DISPOSED">Dihapuskan (Disposed)</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes" className="text-xs">
                Catatan Tambahan
              </Label>
              <textarea
                id="notes"
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Kelengkapan unit, garansi servis, nomor faktur..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              {isEditing ? 'Simpan Perubahan' : 'Daftarkan Aset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

