'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Menu,
  Plus,
  Box,
  UserPlus,
  ArrowRightLeft,
  FileText,
  Bell,
  ChevronDown,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SessionUser } from '@/lib/auth';
import Link from 'next/link';

interface TopbarProps {
  user: SessionUser;
  onOpenSidebar: () => void;
}

export function Topbar({ user, onOpenSidebar }: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    assets: any[];
    employees: any[];
    documents: any[];
  }>({ assets: [], employees: [], documents: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ assets: [], employees: [], documents: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-72 sm:w-96">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aset, serial number, karyawan, BAST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowDropdown(true);
              }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 top-11 z-50 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50">
              {isSearching ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Mencari data...
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {/* Assets */}
                  {searchResults.assets.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Aset ({searchResults.assets.length})
                      </div>
                      {searchResults.assets.map((asset) => (
                        <Link
                          key={asset.id}
                          href={`/assets/${asset.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-indigo-600">
                              [{asset.assetTag}]
                            </span>{' '}
                            {asset.name}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {asset.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Employees */}
                  {searchResults.employees.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Karyawan ({searchResults.employees.length})
                      </div>
                      {searchResults.employees.map((emp) => (
                        <Link
                          key={emp.id}
                          href={`/employees/${emp.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                        >
                          <div>
                            <span className="font-semibold">{emp.fullName}</span>{' '}
                            <span className="text-slate-400">({emp.nik})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {emp.position}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Documents */}
                  {searchResults.documents.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        BAST ({searchResults.documents.length})
                      </div>
                      {searchResults.documents.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/bast/${doc.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                        >
                          <span className="font-mono text-indigo-600 truncate">
                            {doc.documentNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {doc.recipientName}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.assets.length === 0 &&
                    searchResults.employees.length === 0 &&
                    searchResults.documents.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        Tidak ada data yang cocok dengan "{searchQuery}"
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Aksi Cepat</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/assets?action=new" className="flex items-center gap-2">
                <Box className="h-4 w-4 text-indigo-600" />
                <span>Tambah Aset Baru</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/employees?action=new" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                <span>Tambah Karyawan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/transactions/checkout" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                <span>Checkout Aset</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/checkin" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                <span>Return / Kembalikan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/bast/penyerahan" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Buat Dokumen BAST</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Role Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-700">{user.role.replace('_', ' ')}</span>
        </div>
      </div>
    </header>
  );
}
