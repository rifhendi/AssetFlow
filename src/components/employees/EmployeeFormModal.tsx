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

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employee?: any | null;
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}

export function EmployeeFormModal({
  open,
  onOpenChange,
  onSuccess,
  employee,
  departments,
  locations,
}: EmployeeFormModalProps) {
  const isEditing = !!employee;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nik: '',
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    employmentStatus: 'PERMANENT',
    joinDate: '',
    locationId: '',
    notes: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        nik: employee.nik || '',
        fullName: employee.fullName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        departmentId: employee.departmentId || (departments[0]?.id || ''),
        position: employee.position || '',
        employmentStatus: employee.employmentStatus || 'PERMANENT',
        joinDate: employee.joinDate
          ? new Date(employee.joinDate).toISOString().slice(0, 10)
          : '',
        locationId: employee.locationId || '',
        notes: employee.notes || '',
      });
    } else {
      setFormData({
        nik: '',
        fullName: '',
        email: '',
        phone: '',
        departmentId: departments[0]?.id || '',
        position: '',
        employmentStatus: 'PERMANENT',
        joinDate: new Date().toISOString().slice(0, 10),
        locationId: locations[0]?.id || '',
        notes: '',
      });
    }
  }, [employee, departments, locations, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nik.trim()) {
      toast.error('NIK wajib diisi');
      return;
    }
    if (!formData.fullName.trim()) {
      toast.error('Nama karyawan wajib diisi');
      return;
    }
    if (!formData.departmentId) {
      toast.error('Departemen wajib dipilih');
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/employees/${employee.id}` : '/api/employees';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan data karyawan');
      }

      toast.success(
        isEditing
          ? 'Data karyawan berhasil diperbarui!'
          : `Karyawan ${data.fullName} berhasil ditambahkan!`
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
            {isEditing ? `Edit Karyawan: ${employee.fullName}` : 'Tambah Karyawan Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Perbarui informasi profil dan penempatan kerja karyawan.'
              : 'Daftarkan karyawan baru ke dalam basis data sistem inventaris.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nik" className="text-xs">
                Nomor Induk Karyawan (NIK) *
              </Label>
              <Input
                id="nik"
                required
                placeholder="Contoh: EMP-2024-012"
                value={formData.nik}
                onChange={(e) =>
                  setFormData({ ...formData, nik: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="fullName" className="text-xs">
                Nama Lengkap *
              </Label>
              <Input
                id="fullName"
                required
                placeholder="Contoh: Dimas Pratama"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs">
                Email Perusahaan *
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="dimas@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs">
                Nomor Telepon / WhatsApp
              </Label>
              <Input
                id="phone"
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Select
                label="Departemen *"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="position" className="text-xs">
                Jabatan / Posisi *
              </Label>
              <Input
                id="position"
                required
                placeholder="Contoh: Senior Full Stack Engineer"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>

            <div>
              <Select
                label="Status Karyawan"
                value={formData.employmentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, employmentStatus: e.target.value })
                }
              >
                <option value="PERMANENT">Karyawan Tetap (Permanent)</option>
                <option value="CONTRACT">Kontrak (Contract)</option>
                <option value="PROBATION">Masa Percobaan (Probation)</option>
                <option value="INTERN">Magang (Intern)</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="joinDate" className="text-xs">
                Tanggal Bergabung
              </Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) =>
                  setFormData({ ...formData, joinDate: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                label="Lokasi Kantor / Cabang"
                value={formData.locationId}
                onChange={(e) =>
                  setFormData({ ...formData, locationId: e.target.value })
                }
              >
                <option value="">Pilih Lokasi Kantor</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
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
                placeholder="Keterangan penempatan, riwayat kerja..."
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
              {isEditing ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
