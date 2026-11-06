'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Building, Users, Box, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  managerName?: string | null;
  employeeCount: number;
  assetCount: number;
}

export function DepartmentClientView({
  initialDepartments,
}: {
  initialDepartments: DepartmentItem[];
}) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    managerName: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat departemen');

      toast.success(`Departemen ${data.name} berhasil ditambahkan!`);
      setIsModalOpen(false);
      setForm({ name: '', code: '', description: '', managerName: '' });

      const refreshRes = await fetch('/api/departments');
      if (refreshRes.ok) {
        const fresh = await refreshRes.json();
        setDepartments(
          fresh.map((d: any) => ({
            ...d,
            employeeCount: d._count?.employees || 0,
            assetCount: d._count?.assets || 0,
          }))
        );
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Departemen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:border-indigo-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    {dept.name}
                  </CardTitle>
                  <span className="text-[11px] text-slate-400">
                    Manager: {dept.managerName || '-'}
                  </span>
                </div>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                {dept.code}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                {dept.description || 'Tidak ada deskripsi departemen'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold">{dept.employeeCount} Pegawai</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Box className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold">{dept.assetCount} Aset</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Departemen Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan unit departemen organisasi atau divisi baru.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <Label htmlFor="deptName" className="text-xs">
                Nama Departemen *
              </Label>
              <Input
                id="deptName"
                required
                placeholder="Contoh: Legal & Compliance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="deptCode" className="text-xs">
                  Kode Departemen *
                </Label>
                <Input
                  id="deptCode"
                  required
                  placeholder="LGL"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="manager" className="text-xs">
                  Nama Manager / Head
                </Label>
                <Input
                  id="manager"
                  placeholder="Nama Kepala Divisi"
                  value={form.managerName}
                  onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deptDesc" className="text-xs">
                Keterangan
              </Label>
              <Input
                id="deptDesc"
                placeholder="Cakupan fungsi departemen..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" isLoading={isLoading}>
                Simpan Departemen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
