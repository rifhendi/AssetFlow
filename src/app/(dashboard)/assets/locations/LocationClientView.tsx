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
import { Plus, MapPin, Building, Users, Box } from 'lucide-react';
import { toast } from 'sonner';

interface LocationItem {
  id: string;
  code: string;
  name: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  description?: string | null;
  assetCount: number;
  employeeCount: number;
}

export function LocationClientView({
  initialLocations,
}: {
  initialLocations: LocationItem[];
}) {
  const [locations, setLocations] = useState(initialLocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    building: '',
    floor: '',
    room: '',
    description: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat lokasi');

      toast.success(`Lokasi ${data.name} berhasil ditambahkan!`);
      setIsModalOpen(false);
      setForm({ name: '', code: '', building: '', floor: '', room: '', description: '' });

      const refreshRes = await fetch('/api/locations');
      if (refreshRes.ok) {
        const fresh = await refreshRes.json();
        setLocations(
          fresh.map((l: any) => ({
            ...l,
            assetCount: l._count?.assets || 0,
            employeeCount: l._count?.employees || 0,
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
          Tambah Lokasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <Card key={loc.id} className="hover:border-indigo-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    {loc.name}
                  </CardTitle>
                  <span className="text-[11px] text-slate-400">
                    {loc.building || 'Gedung Operasional'}
                  </span>
                </div>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                {loc.code}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 space-y-1 mb-4 min-h-[32px]">
                {loc.floor && <div>Lantai: {loc.floor}</div>}
                {loc.description && <div>{loc.description}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Box className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold">{loc.assetCount} Aset</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold">{loc.employeeCount} Karyawan</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Lokasi Inventaris Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan kantor cabang, gedung, atau gudang penyimpanan perangkat.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <Label htmlFor="locName" className="text-xs">
                Nama Lokasi *
              </Label>
              <Input
                id="locName"
                required
                placeholder="Contoh: Kantor Cabang Semarang"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="locCode" className="text-xs">
                  Kode Lokasi *
                </Label>
                <Input
                  id="locCode"
                  required
                  placeholder="BR-SMG"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="building" className="text-xs">
                  Nama Gedung
                </Label>
                <Input
                  id="building"
                  placeholder="Gedung Pandanaran"
                  value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="floor" className="text-xs">
                  Lantai
                </Label>
                <Input
                  id="floor"
                  placeholder="Lantai 4"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="room" className="text-xs">
                  Ruangan
                </Label>
                <Input
                  id="room"
                  placeholder="Ruang IT Support"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                />
              </div>
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
                Simpan Lokasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

