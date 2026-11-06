'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  endpoint: string;
  title?: string;
  description?: string;
}

export function ExcelImportModal({
  open,
  onOpenChange,
  onSuccess,
  endpoint,
  title = 'Impor Data dari Excel',
  description = 'Unggah file spreadsheet .xlsx atau .xls untuk mengimpor data sekaligus ke dalam database.',
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengimpor file');
      }

      toast.success(`Berhasil mengimpor ${data.count || 0} data!`);
      onOpenChange(false);
      setFile(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat impor');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-center">
            <FileSpreadsheet className="h-10 w-10 text-emerald-600 mb-2" />
            <span className="text-xs font-semibold text-slate-800">
              {file ? file.name : 'Klik untuk memilih file Excel (.xlsx / .xls)'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Ukuran maksimum 10MB'}
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-100 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              Kolom wajib didukung: <strong>Nama Aset</strong>, <strong>Kategori</strong>,{' '}
              <strong>Brand</strong>, <strong>Model</strong>, <strong>Serial Number</strong>,{' '}
              <strong>Harga Pembelian</strong>, <strong>Lokasi</strong>.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!file}
          >
            Mulai Impor Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

