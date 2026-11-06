'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@assetflow.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk ke sistem');
      }

      toast.success(`Selamat datang kembali, ${data.user.name}!`);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error(err.message || 'Gagal masuk');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 mb-4">
            <Box className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Asset<span className="text-indigo-600">Flow</span> Enterprise
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Sistem Pengelolaan Aset, Lifecycle Karyawan & BAST Otomatis
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-xs">
                Alamat Email
              </Label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  Kata Sandi
                </Label>
              </div>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Masuk ke Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Pilih Role Demo (1-Click Test)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('superadmin@assetflow.com')}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="font-semibold text-slate-800">Super Admin</div>
                <div className="text-[10px] text-slate-400">Full System Control</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('admin.asset@assetflow.com')}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="font-semibold text-slate-800">Admin Asset</div>
                <div className="text-[10px] text-slate-400">Assets & Transactions</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('hr.admin@assetflow.com')}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="font-semibold text-slate-800">HR Admin</div>
                <div className="text-[10px] text-slate-400">Employees & Offboarding</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('auditor@assetflow.com')}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="font-semibold text-slate-800">Auditor</div>
                <div className="text-[10px] text-slate-400">Read-Only Audit</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          &copy; 2026 PT Solusi Teknologi Nusantara. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
