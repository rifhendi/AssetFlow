'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

export function BastActionBar({ documentNumber }: { documentNumber: string }) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <Button
        size="sm"
        onClick={handlePrint}
        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
      >
        <Printer className="h-4 w-4" />
        Cetak / Download PDF
      </Button>
    </div>
  );
}
