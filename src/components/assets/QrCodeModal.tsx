'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: {
    assetTag: string;
    name: string;
    serialNumber?: string | null;
    qrCode?: string | null;
  } | null;
}

export function QrCodeModal({ open, onOpenChange, asset }: QrCodeModalProps) {
  if (!asset) return null;

  const qrValue = asset.qrCode || `ASSETFLOW:${asset.assetTag}:${asset.serialNumber || ''}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Label QR Code Aset</DialogTitle>
          <DialogDescription className="text-center text-xs">
            Pindai QR code ini untuk identifikasi cepat dan audit fisik perangkat
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
            <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
          </div>
          <div className="mt-4 text-center">
            <span className="font-mono text-base font-bold text-indigo-600 block">
              {asset.assetTag}
            </span>
            <span className="text-xs font-medium text-slate-800 block mt-0.5">
              {asset.name}
            </span>
            {asset.serialNumber && (
              <span className="text-[11px] text-slate-400 block font-mono">
                SN: {asset.serialNumber}
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Cetak Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
