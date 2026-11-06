'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  FileText,
  Sliders,
  ShieldCheck,
  Save,
  Plus,
  Check,
  Lock,
  Server,
  Layers,
} from 'lucide-react';
import { formatDateShort, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingsClientViewProps {
  company: any;
  users: any[];
  templates: any[];
  auditLogs: any[];
  currentUserRole: string;
}

export function SettingsClientView({
  company: initialCompany,
  users: initialUsers,
  templates: initialTemplates,
  auditLogs,
  currentUserRole,
}: SettingsClientViewProps) {
  // Company Form State
  const [company, setCompany] = useState(initialCompany);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Users State
  const [users, setUsers] = useState(initialUsers);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN_ASSET',
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplates[0] || null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil');
      toast.success('Profil perusahaan berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat user');
      toast.success('Pengguna baru berhasil dibuat!');
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'ADMIN_ASSET' });

      const refreshRes = await fetch('/api/settings/users');
      if (refreshRes.ok) {
        setUsers(await refreshRes.json());
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/settings/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate),
      });
      if (!res.ok) throw new Error('Gagal memperbarui template');
      toast.success('Template dokumen BAST berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="company">Profil Perusahaan</TabsTrigger>
          <TabsTrigger value="users">Pengguna & Role</TabsTrigger>
          <TabsTrigger value="templates">Template BAST</TabsTrigger>
          <TabsTrigger value="system">Sistem & Audit</TabsTrigger>
        </TabsList>

        {/* Tab 1: Company Profile */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Informasi & Identitas Perusahaan
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi ini akan tercetak otomatis pada kop surat dan Berita Acara Serah Terima (BAST).
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCompany}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="compName" className="text-xs">
                      Nama Resmi Perusahaan *
                    </Label>
                    <Input
                      id="compName"
                      required
                      value={company?.name || ''}
                      onChange={(e) =>
                        setCompany({ ...company, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="compCode" className="text-xs">
                      Kode Organisasi (Tenant Code)
                    </Label>
                    <Input
                      id="compCode"
                      disabled
                      value={company?.code || ''}
                      className="bg-slate-100 font-mono text-slate-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="compAddress" className="text-xs">
                      Alamat Kantor Pusat
                    </Label>
                    <Input
                      id="compAddress"
                      value={company?.address || ''}
                      onChange={(e) =>
                        setCompany({ ...company, address: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="compPhone" className="text-xs">
                      Nomor Telepon
                    </Label>
                    <Input
                      id="compPhone"
                      value={company?.phone || ''}
                      onChange={(e) =>
                        setCompany({ ...company, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="compEmail" className="text-xs">
                      Email Resmi Perusahaan
                    </Label>
                    <Input
                      id="compEmail"
                      type="email"
                      value={company?.email || ''}
                      onChange={(e) =>
                        setCompany({ ...company, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="compWeb" className="text-xs">
                      Website
                    </Label>
                    <Input
                      id="compWeb"
                      value={company?.website || ''}
                      onChange={(e) =>
                        setCompany({ ...company, website: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="compFormat" className="text-xs">
                      Format Penomoran BAST
                    </Label>
                    <Input
                      id="compFormat"
                      value={company?.bastNumberFormat || ''}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          bastNumberFormat: e.target.value,
                        })
                      }
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSavingCompany}
                  className="gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Users & Roles */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Manajemen Pengguna & Hak Akses (RBAC)
                </CardTitle>
                <CardDescription className="text-xs">
                  Atur peran SUPER ADMIN, ADMIN ASSET, HR ADMIN, AUDITOR, dan EMPLOYEE.
                </CardDescription>
              </div>
              {currentUserRole === 'SUPER_ADMIN' && (
                <Button
                  size="sm"
                  onClick={() => setIsUserModalOpen(true)}
                  className="gap-1.5 shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Akun Pengguna
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white text-xs gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 uppercase">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{u.name}</span>
                          <StatusBadge type="role" value={u.role} />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {u.email}
                          {u.employee && ` • Terhubung ke ${u.employee.fullName}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-[11px] text-slate-400">
                        {u.isActive ? (
                          <span className="text-emerald-600 font-semibold">Aktif</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">Nonaktif</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Document Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Kustomisasi Template Dokumen BAST
              </CardTitle>
              <CardDescription className="text-xs">
                Ubah klausul ketentuan, pernyataan hukum, dan kalimat pembuka dokumen BAST.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <Button
                    key={tpl.id}
                    type="button"
                    variant={
                      selectedTemplate?.id === tpl.id ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedTemplate(tpl)}
                    className="text-xs"
                  >
                    {tpl.type}
                  </Button>
                ))}
              </div>

              {selectedTemplate && (
                <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="tplTitle" className="text-xs">
                      Judul Resmi Dokumen
                    </Label>
                    <Input
                      id="tplTitle"
                      value={selectedTemplate.title}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="tplHeader" className="text-xs">
                      Kalimat Pembuka (Recital)
                    </Label>
                    <textarea
                      id="tplHeader"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedTemplate.headerText}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          headerText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="tplTerms" className="text-xs">
                      Syarat, Ketentuan & Tanggung Jawab Hukum
                    </Label>
                    <textarea
                      id="tplTerms"
                      rows={5}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedTemplate.termsAndConditions}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          termsAndConditions: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="tplFooter" className="text-xs">
                      Kalimat Penutup Dokumen
                    </Label>
                    <textarea
                      id="tplFooter"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedTemplate.footerText || ''}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          footerText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSavingTemplate}
                      className="gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      Simpan Template {selectedTemplate.type}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: System Settings & Multi-tenant Foundation */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Fondasi Arsitektur Multi-Tenant SaaS
                </CardTitle>
                <CardDescription className="text-xs">
                  Status isolasi data, UUID identifiers, dan integritas database PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-400 block text-[10px]">
                      Tenant ID (Organisasi)
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-700 block mt-1">
                      {company?.id}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-400 block text-[10px]">
                      Isolasi Tenant
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Aktif (Company-Scoped Query)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-400 block text-[10px]">
                      Database Engine
                    </span>
                    <span className="font-bold text-slate-800 block mt-1">
                      PostgreSQL 16.4 • Prisma ORM
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-400 block text-[10px]">
                      Paket Langganan
                    </span>
                    <span className="font-bold text-indigo-600 block mt-1">
                      Enterprise Tier (Unlimited Assets)
                    </span>
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-900 mb-3">
                    Log Audit Sistem Terakhir (Immutable Logs)
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-[11px]"
                      >
                        <div>
                          <span className="font-mono font-bold text-indigo-600 mr-2">
                            {log.action}
                          </span>
                          <span className="text-slate-700">
                            {log.entity}
                            {log.entityId && ` (${log.entityId.slice(0, 8)}...)`}
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Status Server & Layanan
                </CardTitle>
                <CardDescription className="text-xs">
                  Konektivitas daemon dan backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <span className="font-medium">PostgreSQL Service</span>
                  <span className="font-bold">Online (5432)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <span className="font-medium">Prisma Client ORM</span>
                  <span className="font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <span className="font-medium">JWT Session Auth</span>
                  <span className="font-bold">Protected</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Akun Pengguna Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Buat akun dengan hak akses sesuai tanggung jawab kerja.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div>
              <Label htmlFor="uName" className="text-xs">
                Nama Lengkap *
              </Label>
              <Input
                id="uName"
                required
                placeholder="Nama Staf"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="uEmail" className="text-xs">
                Email *
              </Label>
              <Input
                id="uEmail"
                type="email"
                required
                placeholder="staf@company.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="uPass" className="text-xs">
                Password *
              </Label>
              <Input
                id="uPass"
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>

            <div>
              <Select
                label="Peran / Role Pengguna *"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="ADMIN_ASSET">Admin Asset (Kelola Aset & Transaksi)</option>
                <option value="HR_ADMIN">HR Admin (Kelola Karyawan & Offboarding)</option>
                <option value="AUDITOR">Auditor (Read-Only Aset & Dokumen)</option>
                <option value="EMPLOYEE">Employee (Lihat Aset Sendiri)</option>
                <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
              </Select>
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUserModalOpen(false)}
                disabled={isSavingUser}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" isLoading={isSavingUser}>
                Buat Pengguna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
