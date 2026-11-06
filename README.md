# AssetFlow — Enterprise Asset & Lifecycle Management System

![AssetFlow Architecture](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Prisma](https://img.shields.io/badge/Prisma%20ORM-5.22-1b222d)

**AssetFlow** adalah sistem enterprise terpadu untuk pencatatan, distribusi, pemeliharaan, dan siklus hidup (lifecycle) aset perusahaan. Dibangun dengan standar SaaS enterprise yang dirancang khusus untuk mematuhi regulasi dan format hukum operasional korporat Indonesia, termasuk generator **Berita Acara Serah Terima (BAST)** otomatis, manajemen checkout/check-in atomik, audit trail kepemilikan, dan proses offboarding karyawan yang ketat (Pensiun, Resign, Kontrak, Mutasi).

---

## 🌟 Fitur Utama (Core Enterprise Features)

### 1. Executive Dashboard & Real-Time Analytics
- **Live Metric Cards**: Total Registered Assets, Available Assets, Assigned Assets, Under Maintenance, Retired/Disposed, Total Employees, dan Pending Asset Returns.
- **Recharts Interactive Data Visualizations**:
  - Distribusi status aset (Donut/Pie Chart).
  - Distribusi aset per departemen & kategori (Bar Chart).
  - Ringkasan nilai investasi aset (Asset Valuation).
- **Quick Action Bar**: Akses langsung 1-klik untuk Tambah Aset, Tambah Karyawan, Penyerahan Aset (Checkout), Pengembalian Aset (Check-in), dan Pembuatan BAST.
- **Activity Feed**: Riwayat transaksi aset terbaru dan arsip dokumen BAST yang baru diterbitkan.

### 2. Comprehensive Asset Management
- **Enterprise Data Table**: Pencarian real-time multi-kolom, filter multi-dimensi (Kategori, Lokasi, Status, Departemen), sorting, dan pagination.
- **Lifecycle Status Tracking**:
  - `AVAILABLE`, `ASSIGNED`, `IN_USE`, `MAINTENANCE`, `RETURNED`, `RETIRED`, `LOST`, `DISPOSED`.
- **Informasi Aset Lengkap**: Asset Tag, Serial Number, Spesifikasi Teknis, Tanggal & Nilai Pembelian, Masa Garansi, Lokasi, Departemen penanggung jawab, Kondisi Fisik (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), dan Foto Aset.
- **Asset Detail Page**:
  - Tab Overview & Spesifikasi Teknis.
  - Current Assignment (Karyawan pemegang saat ini).
  - Asset Timeline & Maintenance History.
  - Arsip Dokumen BAST Terkait.
- **QR Code Asset Label**: Generator kode QR dan label cetak aset otomatis untuk inventarisasi fisik.
- **Excel Import & Export**: Ekspor seluruh database aset ke format `.xlsx` (Excel) dan import massal via template spreadsheet.

### 3. Employee & Department Management
- **Database Karyawan Lengkap**: NIK, Nama Lengkap, Departemen, Jabatan, Email, No. HP/Telepon, Lokasi Kerja, Tanggal Bergabung, dan Status Kerja (`ACTIVE`, `PROBATION`, `CONTRACT`, `RESIGNED`, `RETIRED`, `TERMINATED`).
- **Counter Aset Dinamis**: Menghitung secara otomatis jumlah aset aktif yang sedang dipegang oleh masing-masing karyawan.
- **Employee Detail Page (4 Tab Profesional)**:
  1. *Overview*: Biodata, struktur organisasi, dan kontak.
  2. *Assigned Assets*: Daftar aset yang saat ini dikuasai oleh karyawan bersangkutan beserta tanggal serah terima.
  3. *Asset History*: Riwayat lengkap seluruh aset yang pernah diserahterimakan atau dikembalikan di masa lalu.
  4. *Dokumen BAST*: Seluruh dokumen serah terima dan pengembalian yang ditandatangani oleh karyawan tersebut.
- **Excel Import & Export**: Import/export database karyawan dalam format Excel.

### 4. Asset Transactions Engine (Checkout, Check-in & Transfer)
- **Asset Checkout Wizard (5 Langkah Interaktif)**:
  - Step 1: Pilih Karyawan Penerima.
  - Step 2: Pilih Aset (Hanya aset berstatus `AVAILABLE` yang dapat dipilih, mendukung multi-aset dalam satu transaksi).
  - Step 3: Pengisian Detail (Tanggal Checkout, Lokasi Penugasan, Kondisi Fisik, Kelengkapan Aksesoris, Catatan).
  - Step 4: Review Rincian Transaksi.
  - Step 5: Konfirmasi & Eksekusi Atomik.
  - *Otomasi*: Transaksi PostgreSQL atomik secara otomatis mengubah status aset menjadi `ASSIGNED`, membuat relasi `AssetAssignment`, mencatat `AssetTransaction`, dan **men-generate Dokumen BAST Penyerahan** resmi.
- **Asset Check-in / Return Wizard (Komperehensif)**:
  - Pemilihan karyawan dan deteksi otomatis aset yang sedang dipegang.
  - Inspeksi kondisi fisik saat pengembalian (Quality Control).
  - Checklist aksesoris/kelengkapan.
  - Menutup penugasan, mengubah status aset menjadi `AVAILABLE` atau `MAINTENANCE` (bila kondisi rusak), dan **men-generate Dokumen BAST Pengembalian**.
  - Riwayat kepemilikan aset sebelumnya **tetap utuh dan diarsipkan secara permanen**.
- **Asset Transfer**: Pemindahan tanggung jawab aset antar karyawan atau perpindahan lokasi fisik aset.

### 5. Employee Offboarding & Asset Clearance (Pensiun, Resign, Kontrak)
- Modul khusus penyelesaian inventaris karyawan yang mengakhiri masa tugas:
  - Alasan Terminasi: `Pensiun`, `Resign`, `Habis Kontrak`, `Mutasi`, atau `Terminasi Lainnya`.
  - Rekonsiliasi Aset: Menampilkan daftar seluruh aset yang masih dipegang karyawan.
  - Checklist pengembalian aset dan identifikasi aset tertunggak (*Outstanding Assets*).
  - Proteksi: Menampilkan peringatan tegas jika ada aset yang belum dikembalikan sebelum finalisasi.
  - Status karyawan diperbarui menjadi `INACTIVE` / `RETIRED` tanpa menghapus riwayat audit di masa lalu.
  - Otomatis menerbitkan **BAST Pensiun** atau **BAST Non-Pensiun**.

### 6. Indonesian Formal BAST Document Generator (Fitur Utama)
Sistem memproduksi dokumen hukum formal Berita Acara Serah Terima (BAST) sesuai standar administrasi korporat Indonesia:
- **4 Tipe Dokumen Resmi**:
  1. `BAST_PENYERAHAN`: Berita Acara Serah Terima Penyerahan Aset.
  2. `BAST_PENGEMBALIAN`: Berita Acara Serah Terima Pengembalian Aset.
  3. `BAST_PENSIUN`: Berita Acara Penyelesaian Aset Karyawan Pensiun.
  4. `BAST_NON_PENSIUN`: Berita Acara Penyelesaian Aset Terminasi / Resign / Mutasi.
- **Format Penomoran Otomatis**: `BAST/{TIPE}/{YYYY}/{MM}/{NOMOR_URUT}` (Contoh: `BAST/PENYERAHAN/2026/11/0001`).
- **Struktur Dokumen Legal**:
  - Kop Perusahaan (Logo, Nama PT, Alamat Lengkap, Kontak Resmi).
  - Judul Dokumen dan Nomor Surat Resmi.
  - Klausul Pembuka: *“Pada hari ini [Hari, Tanggal Bulan Tahun], telah dilakukan serah terima aset perusahaan antara...”*
  - Identitas Lengkap Pihak Pertama (Penyerah / Management / HR / Asset Admin).
  - Identitas Lengkap Pihak Kedua (Penerima / Karyawan, NIK, Departemen, Jabatan).
  - Tabel Rincian Aset (No, Tag Aset, Nama Aset, Merek/Model, No Seri, Kondisi, Aksesoris/Keterangan).
  - Pernyataan Tanggung Jawab Hukum dan Pemeliharaan Aset.
  - Kolom Tanda Tangan Ganda (*Dual Signature Blocks*) untuk Pihak Pertama dan Pihak Kedua.
- **Kemampuan Dokumen**:
  - Tampilan Web Presisi.
  - Tombol **Cetak / Print PDF** dengan CSS `@media print` teroptimasi untuk kertas ukuran A4.
  - Riwayat status dokumen (`DRAFT`, `SUBMITTED`, `APPROVED`, `SIGNED`, `REJECTED`).
  - Template BAST dapat disesuaikan di menu Pengaturan (*Document Templates*).

### 7. Laporan Eksekutif & Export Excel / PDF
- **Asset Inventory Report**: Laporan inventaris seluruh aset terdaftar beserta nilai buku dan kondisi.
- **Employee Asset Report**: Laporan rekapitulasi aset yang sedang dipegang oleh setiap karyawan.
- **Asset Movement Report**: Log perpindahan, mutasi, dan sirkulasi aset antar unit.
- **Asset Retirement Report**: Rekapitulasi aset rusak, hilang, atau yang telah dihapusbukukan (*disposed*).
- **1-Click Download**: Ekspor langsung laporan dalam format spreadsheet Microsoft Excel (`.xlsx`).

### 8. Role-Based Access Control (RBAC) & Security
- Autentikasi aman berbasis JWT (`jose`) dan password hashing (`bcryptjs`).
- 5 Tingkatan Hak Akses:
  1. `SUPER_ADMIN`: Akses penuh ke seluruh modul, pengaturan perusahaan, user, dan audit log.
  2. `ADMIN_ASSET`: Pengelolaan penuh aset, transaksi checkout, check-in, dan dokumen BAST.
  3. `HR_ADMIN`: Pengelolaan karyawan, departemen, dan proses Employee Offboarding.
  4. `AUDITOR`: Akses Read-Only ke data aset, laporan kepatuhan, transaksi, dan audit log.
  5. `EMPLOYEE`: Akses mandiri untuk melihat aset pribadi yang sedang dipinjamkan.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [PostCSS](https://postcss.org/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) Primitives |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) |
| **ORM** | [Prisma ORM 5](https://www.prisma.io/) |
| **Data Tables** | [TanStack Table v8](https://tanstack.com/table/v8) |
| **Charts** | [Recharts 2](https://recharts.org/) |
| **Excel Engine** | [SheetJS (xlsx)](https://docs.sheetjs.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Auth & Security** | JWT Stateless Sessions via [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js**: v18.17+ atau v20+ (Rekomendasi v20.18+)
- **PostgreSQL**: v14+ atau v16+
- **NPM** atau **Yarn** / **PNPM**

### 2. Kloning Repository & Instal Dependensi
```bash
git clone <repository-url> AssetFlow
cd AssetFlow
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan isi `.env` dengan kredensial database PostgreSQL Anda:
```env
# Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/assetflow?schema=public"

# Authentication Secret (Gunakan string acak minimal 32 karakter untuk produksi)
JWT_SECRET="assetflow_enterprise_production_super_secret_jwt_key_2026_xyz"
JWT_EXPIRES_IN="7d"

# App Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database & Seeding Data
Jalankan migrasi schema Prisma dan seed data awal:
```bash
# Push schema ke database PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Jalankan Seeding data contoh perusahaan Indonesia (PT Solusi Teknologi Nusantara)
npm run seed
```

### 5. Menjalankan Aplikasi

**Mode Pengembangan (Development):**
```bash
npm run dev
```
Akses aplikasi di browser: [http://localhost:3000](http://localhost:3000)

**Mode Produksi (Production Build & Start):**
```bash
npm run build
npm start
```

---

## 🔑 Akun Demo & Kredensial Login

Aplikasi telah dilengkapi dengan fitur **1-Click Demo Login** pada halaman `/login`. Anda dapat memilih peran mana pun secara langsung, atau menggunakan kredensial manual berikut:

| Peran (Role) | Email | Password | Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@assetflow.com` | `password123` | Akses penuh (Semua modul & Pengaturan) |
| **Admin Asset** | `admin.asset@assetflow.com` | `password123` | Manajemen Aset, Transaksi, BAST, Laporan |
| **HR Admin** | `hr.admin@assetflow.com` | `password123` | Manajemen Karyawan, Departemen, Offboarding |
| **Auditor** | `auditor@assetflow.com` | `password123` | Read-only Aset, Transaksi, Audit Trail, Laporan |
| **Employee** | `karyawan@assetflow.com` | `password123` | Dashboard Aset Pribadi |

---

## 📂 Struktur Direktori Proyek

```
AssetFlow/
├── prisma/
│   ├── schema.prisma          # Model database relasional (Asset, Employee, BAST, dsb)
│   └── seed.js                # Database seeder dengan data perusahaan Indonesia
├── public/                    # Aset statis & logo
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/login/      # Halaman Login dengan 1-click switcher
│   │   ├── (dashboard)/       # Layout utama & sub-halaman dashboard
│   │   │   ├── page.tsx       # Executive KPI & Analytics Dashboard
│   │   │   ├── assets/        # Modul Aset, Kategori, Lokasi, Status
│   │   │   ├── employees/     # Modul Karyawan, Departemen, Detail 4-Tab
│   │   │   ├── transactions/  # Checkout Wizard, Checkin, Transfer, Riwayat
│   │   │   ├── offboarding/   # Employee Offboarding & Clearance
│   │   │   ├── bast/          # Dokumen BAST (Penyerahan, Pengembalian, Pensiun, Non-Pensiun)
│   │   │   ├── reports/       # Laporan Inventaris & Export Excel
│   │   │   └── settings/      # Profil Perusahaan, Pengguna & Template BAST
│   │   ├── api/               # RESTful API Endpoints (Auth, Assets, BAST, Transactions, dsb)
│   │   ├── globals.css        # Tailwind styling & @media print A4 rules
│   │   └── layout.tsx         # Root layout dengan dynamic session provider
│   ├── components/            # Komponen modular
│   │   ├── ui/                # UI kit (Button, Dialog, Card, Table, Select, Tabs, dsb)
│   │   ├── layout/            # Sidebar, Topbar dengan live search
│   │   ├── dashboard/         # Recharts Analytics widgets
│   │   ├── assets/            # TanStack AssetTable, AssetFormModal, ExcelImport, QR Code
│   │   ├── employees/         # EmployeeTable, EmployeeFormModal
│   │   ├── transactions/      # 5-Step CheckoutWizard, CheckinWizard, TransferClient
│   │   ├── offboarding/       # OffboardingWizard
│   │   └── bast/              # BastDocumentPrintView (Legal layout & signature blocks)
│   └── lib/                   # Utility libraries
│       ├── prisma.ts          # Singleton Prisma Client
│       ├── auth.ts            # JWT authentication & session verification
│       ├── constants.ts       # Role, status, dan condition enums
│       ├── utils.ts           # Format mata uang IDR, tanggal Indonesia, BAST generator
│       └── excel.ts           # Parser SheetJS untuk import/export Excel
└── scripts/
    └── e2e-verify.js          # Skrip verifikasi end-to-end otomatis
```

---

## 📄 Format Resmi Dokumen BAST

Setiap dokumen BAST yang dihasilkan mengikuti format legal Indonesia:
1. **Nomor Dokumen Otomatis**: Dilengkapi bulan dan tahun Romawi/Masehi sesuai tata laksana administrasi surat menyurat korporat.
2. **Kop Surat Resmi Perusahaan**: Nama PT, NIB/NPWP, alamat kantor, email, dan logo.
3. **Pihak Pertama & Kedua**: Nama jelas, NIK, jabatan, dan departemen penanggung jawab.
4. **Tabel Rincian Aset**: Menampilkan nomor tag, spesifikasi, kondisi, dan kelengkapan aksesoris.
5. **Klausul Integritas**: Pernyataan kepatuhan inventaris dan tanggung jawab pemeliharaan.
6. **Blok Tanda Tangan Ganda**: Ruang tanda tangan legal untuk kedua belah pihak lengkap dengan titimangsa kota dan tanggal.

---

## 🧪 Pengujian Otomatis (E2E Verification)

Untuk memverifikasi fungsionalitas seluruh modul (Autentikasi, Aset, Karyawan, Checkout atomik, BAST generator, Return, dan Export Excel), jalankan:
```bash
node scripts/e2e-verify.js
```

---

## 🛡️ Lisensi & Hak Cipta
Hak Cipta © 2026 **AssetFlow Enterprise Systems**. Dilindungi oleh undang-undang.
Dirancang untuk keandalan, akuntabilitas inventaris, dan efisiensi operasional korporat Indonesia.

