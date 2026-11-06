'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Users,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Layers,
  MapPin,
  Activity,
  Building2,
  LogOut,
  FolderTree,
  UserX,
  FileCheck2,
  Archive,
  History,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionUser } from '@/lib/auth';

interface SidebarProps {
  user: SessionUser;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    assets: true,
    employees: true,
    transactions: true,
    bast: true,
  });

  const toggleSubmenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Asset<span className="text-indigo-600">Flow</span>
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                {user.companyName}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Navigation Group */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Menu Utama
            </div>
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === '/'
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Dashboard</span>
              </Link>

              {/* Asset Management */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSubmenu('assets')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/assets')
                      ? 'text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Box className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Asset Management</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      openMenus.assets && 'rotate-180'
                    )}
                  />
                </button>
                {openMenus.assets && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-slate-200/80 pl-3">
                    <Link
                      href="/assets"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/assets'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      All Assets
                    </Link>
                    <Link
                      href="/assets/categories"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/assets/categories'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Asset Categories
                    </Link>
                    <Link
                      href="/assets/locations"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/assets/locations'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Asset Locations
                    </Link>
                    <Link
                      href="/assets/status"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/assets/status'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Asset Status Lifecycle
                    </Link>
                  </div>
                )}
              </div>

              {/* Employee Management */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSubmenu('employees')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/employees')
                      ? 'text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Employee Management</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      openMenus.employees && 'rotate-180'
                    )}
                  />
                </button>
                {openMenus.employees && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-slate-200/80 pl-3">
                    <Link
                      href="/employees"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/employees'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Employee List
                    </Link>
                    <Link
                      href="/employees/departments"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/employees/departments'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Departments
                    </Link>
                  </div>
                )}
              </div>

              {/* Asset Transactions */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSubmenu('transactions')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/transactions')
                      ? 'text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Asset Transactions</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      openMenus.transactions && 'rotate-180'
                    )}
                  />
                </button>
                {openMenus.transactions && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-slate-200/80 pl-3">
                    <Link
                      href="/transactions/checkout"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/transactions/checkout'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Asset Checkout
                    </Link>
                    <Link
                      href="/transactions/checkin"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/transactions/checkin'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Asset Check-in
                    </Link>
                    <Link
                      href="/transactions/transfer"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/transactions/transfer'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Transfer Asset
                    </Link>
                    <Link
                      href="/transactions/history"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/transactions/history'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Transaction History
                    </Link>
                  </div>
                )}
              </div>

              {/* Employee Offboarding */}
              <Link
                href="/offboarding"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/offboarding')
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <UserX className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Employee Offboarding</span>
              </Link>
            </nav>
          </div>

          {/* Documents & Reports Group */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Dokumen & Laporan
            </div>
            <nav className="space-y-1">
              {/* BAST Management */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSubmenu('bast')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/bast')
                      ? 'text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>BAST Management</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      openMenus.bast && 'rotate-180'
                    )}
                  />
                </button>
                {openMenus.bast && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-slate-200/80 pl-3">
                    <Link
                      href="/bast"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/bast'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      All Documents
                    </Link>
                    <Link
                      href="/bast/penyerahan"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/bast/penyerahan'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      BAST Penyerahan
                    </Link>
                    <Link
                      href="/bast/pengembalian"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/bast/pengembalian'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      BAST Pengembalian
                    </Link>
                    <Link
                      href="/bast/pensiun"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/bast/pensiun'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      BAST Pensiun
                    </Link>
                    <Link
                      href="/bast/non-pensiun"
                      onClick={onClose}
                      className={cn(
                        'block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                        pathname === '/bast/non-pensiun'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      BAST Non-Pensiun
                    </Link>
                  </div>
                )}
              </div>

              {/* Reports */}
              <Link
                href="/reports"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/reports')
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Reports & Analytics</span>
              </Link>
            </nav>
          </div>

          {/* System Settings Group */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Pengaturan
            </div>
            <nav className="space-y-1">
              <Link
                href="/settings"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/settings')
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Settings className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white uppercase">
                {user.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              title="Keluar"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600 transition-colors shadow-none hover:shadow-xs"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
