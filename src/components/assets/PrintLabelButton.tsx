'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintLabelButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-4 w-full gap-2 text-xs"
      onClick={() => window.print()}
    >
      <Printer className="h-3.5 w-3.5" />
      Cetak Stiker Label
    </Button>
  );
}

