import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AssetFlow - Enterprise Asset & Lifecycle Management System',
  description:
    'Sistem Enterprise Pengelolaan Aset, Siklus Hidup Karyawan, Transaksi, dan BAST Otomatis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
