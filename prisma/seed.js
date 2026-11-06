const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AssetFlow database with enterprise Indonesian data...');

  // 1. Create or Find Company
  const company = await prisma.company.upsert({
    where: { code: 'STN' },
    update: {},
    create: {
      name: 'PT Solusi Teknologi Nusantara',
      code: 'STN',
      logoUrl: '/images/company-logo.png',
      address: 'Cyber 2 Tower Lt. 18, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950',
      phone: '+62 21 5289 7700',
      email: 'corporate@solusinusantara.co.id',
      website: 'https://solusinusantara.co.id',
      bastNumberFormat: 'BAST/{type}/{year}/{month}/{seq}',
      signatureTitle1: 'PIHAK PERTAMA (IT ASSET MANAGEMENT)',
      signatureName1: 'Budi Wicaksono, S.Kom.',
      signatureTitle2: 'PIHAK KEDUA (PENERIMA / KARYAWAN)',
      signatureName2: 'Karyawan Bersangkutan',
    },
  });

  const companyId = company.id;

  // 2. Create Departments
  const departmentsData = [
    { code: 'IT', name: 'Information & Technology', description: 'Divisi Teknologi Informasi, Infrastruktur, dan Software', managerName: 'Ahmad Fauzi' },
    { code: 'HR', name: 'Human Resources & General Affairs', description: 'Divisi Sumber Daya Manusia dan Umum', managerName: 'Siti Rahmawati' },
    { code: 'FIN', name: 'Finance & Accounting', description: 'Divisi Keuangan, Akuntansi, dan Pajak', managerName: 'Maya Indriani' },
    { code: 'MKT', name: 'Sales & Marketing', description: 'Divisi Pemasaran, Komersial, dan Kemitraan', managerName: 'Reza Firmansyah' },
    { code: 'OPS', name: 'Operations & Logistics', description: 'Divisi Operasional Lapangan dan Rantai Pasok', managerName: 'Bambang Suhartono' },
  ];

  const deptMap = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { companyId_code: { companyId, code: dept.code } },
      update: {},
      create: { ...dept, companyId },
    });
    deptMap[dept.code] = d.id;
  }

  // 3. Create Locations
  const locationsData = [
    { code: 'HQ-JKT', name: 'Kantor Pusat Cyber 2 Jakarta', building: 'Cyber 2 Tower', floor: 'Lantai 18', room: 'Ruang Kerja Utama', description: 'Kantor pusat operasional' },
    { code: 'WHS-CKR', name: 'Gudang & Logistik Cikarang', building: 'GIIC Industrial Estate', floor: 'Lantai 1', room: 'Gudang A', description: 'Pusat penyimpanan aset dan logistik' },
    { code: 'BR-SBY', name: 'Kantor Cabang Surabaya', building: 'Intiland Tower Surabaya', floor: 'Lantai 8', room: 'Suite 802', description: 'Kantor operasional regional timur' },
    { code: 'BR-BDG', name: 'Kantor Cabang Bandung', building: 'Dago Digital Hub', floor: 'Lantai 3', room: 'Ruang 305', description: 'Kantor pengembangan inovasi' },
  ];

  const locMap = {};
  for (const loc of locationsData) {
    const l = await prisma.assetLocation.upsert({
      where: { companyId_code: { companyId, code: loc.code } },
      update: {},
      create: { ...loc, companyId },
    });
    locMap[loc.code] = l.id;
  }

  // 4. Create Categories
  const categoriesData = [
    { code: 'LAP', name: 'Laptop & Notebook', prefix: 'AST-LAP', icon: 'Laptop', description: 'Komputer jinjing karyawan dan workstation bergerak' },
    { code: 'PC', name: 'Desktop PC & Workstation', prefix: 'AST-PC', icon: 'Monitor', description: 'Komputer meja dan server pengembang' },
    { code: 'MON', name: 'Monitor & Layar Display', prefix: 'AST-MON', icon: 'Tv', description: 'Layar monitor eksternal dan panel presentasi' },
    { code: 'MOB', name: 'Smartphone & Tablet', prefix: 'AST-MOB', icon: 'Smartphone', description: 'Gawai genggam komunikasi kerja dan tablet operasional' },
    { code: 'VEH', name: 'Kendaraan Operasional', prefix: 'AST-VEH', icon: 'Car', description: 'Mobil dan motor operasional dinas perusahaan' },
    { code: 'NET', name: 'Perangkat Jaringan', prefix: 'AST-NET', icon: 'Network', description: 'Router, switch, access point, dan firewall' },
    { code: 'FUR', name: 'Perabot & Furnitur Kantor', prefix: 'AST-FUR', icon: 'Armchair', description: 'Meja kerja ergonomis, kursi kerja, dan brankas' },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.assetCategory.upsert({
      where: { companyId_code: { companyId, code: cat.code } },
      update: {},
      create: { ...cat, companyId },
    });
    catMap[cat.code] = c.id;
  }

  // 5. Create Employees
  const employeesData = [
    { nik: 'EMP-2022-001', fullName: 'Budi Wicaksono', email: 'budi.wicaksono@solusinusantara.co.id', phone: '081234567801', deptCode: 'IT', position: 'IT Asset & Infrastructure Lead', status: 'PERMANENT', joinDate: new Date('2022-01-10'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2022-002', fullName: 'Siti Rahmawati', email: 'siti.rahmawati@solusinusantara.co.id', phone: '081234567802', deptCode: 'HR', position: 'HR Operations Manager', status: 'PERMANENT', joinDate: new Date('2022-02-15'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2023-003', fullName: 'Dimas Pratama', email: 'dimas.pratama@solusinusantara.co.id', phone: '081234567803', deptCode: 'IT', position: 'Senior Full Stack Engineer', status: 'PERMANENT', joinDate: new Date('2023-03-01'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2023-004', fullName: 'Anisa Larasati', email: 'anisa.larasati@solusinusantara.co.id', phone: '081234567804', deptCode: 'MKT', position: 'Digital Marketing Specialist', status: 'PERMANENT', joinDate: new Date('2023-05-15'), locCode: 'BR-BDG' },
    { nik: 'EMP-2023-005', fullName: 'Fajar Nugroho', email: 'fajar.nugroho@solusinusantara.co.id', phone: '081234567805', deptCode: 'FIN', position: 'Senior Financial Analyst', status: 'PERMANENT', joinDate: new Date('2023-06-20'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-006', fullName: 'Dewi Lestari', email: 'dewi.lestari@solusinusantara.co.id', phone: '081234567806', deptCode: 'OPS', position: 'Logistics Coordinator', status: 'PERMANENT', joinDate: new Date('2024-01-08'), locCode: 'WHS-CKR' },
    { nik: 'EMP-2024-007', fullName: 'Rizky Kurniawan', email: 'rizky.kurniawan@solusinusantara.co.id', phone: '081234567807', deptCode: 'IT', position: 'DevOps & Cloud Engineer', status: 'PERMANENT', joinDate: new Date('2024-02-01'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-008', fullName: 'Hendro Prasetyo', email: 'hendro.prasetyo@solusinusantara.co.id', phone: '081234567808', deptCode: 'FIN', position: 'Internal Audit Specialist', status: 'PERMANENT', joinDate: new Date('2024-03-15'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-009', fullName: 'Gita Permata', email: 'gita.permata@solusinusantara.co.id', phone: '081234567809', deptCode: 'MKT', position: 'Content Strategist', status: 'CONTRACT', joinDate: new Date('2024-04-01'), locCode: 'BR-SBY' },
    { nik: 'EMP-2021-010', fullName: 'Suwandi Kusuma', email: 'suwandi.kusuma@solusinusantara.co.id', phone: '081234567810', deptCode: 'OPS', position: 'Senior Fleet Supervisor', status: 'PERMANENT', joinDate: new Date('2021-08-01'), locCode: 'WHS-CKR' },
  ];

  const empMap = {};
  for (const emp of employeesData) {
    const e = await prisma.employee.upsert({
      where: { companyId_nik: { companyId, nik: emp.nik } },
      update: {},
      create: {
        companyId,
        nik: emp.nik,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        departmentId: deptMap[emp.deptCode],
        position: emp.position,
        employmentStatus: emp.status,
        joinDate: emp.joinDate,
        locationId: locMap[emp.locCode],
      },
    });
    empMap[emp.nik] = e.id;
  }

  // 6. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const usersData = [
    { email: 'superadmin@assetflow.com', name: 'Super Administrator', role: 'SUPER_ADMIN', employeeId: null },
    { email: 'admin.asset@assetflow.com', name: 'Budi Wicaksono', role: 'ADMIN_ASSET', employeeId: empMap['EMP-2022-001'] },
    { email: 'hr.admin@assetflow.com', name: 'Siti Rahmawati', role: 'HR_ADMIN', employeeId: empMap['EMP-2022-002'] },
    { email: 'auditor@assetflow.com', name: 'Hendro Prasetyo', role: 'AUDITOR', employeeId: empMap['EMP-2024-008'] },
    { email: 'karyawan@assetflow.com', name: 'Dimas Pratama', role: 'EMPLOYEE', employeeId: empMap['EMP-2023-003'] },
  ];

  const userMap = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        companyId,
        email: u.email,
        name: u.name,
        password: passwordHash,
        role: u.role,
        employeeId: u.employeeId,
      },
    });
    userMap[u.role] = user.id;
  }

  // 7. Create BAST Templates
  const templates = [
    {
      type: 'PENYERAHAN',
      title: 'BERITA ACARA SERAH TERIMA ASET (PENYERAHAN)',
      headerText: 'Pada hari ini, telah dilakukan serah terima aset inventaris perusahaan sebagai fasilitas penunjang pekerjaan kedinasan antara:',
      termsAndConditions: '1. Pihak Kedua bertanggung jawab penuh atas pemeliharaan dan keamanan fisik aset yang diserahkan.\n2. Segala bentuk kerusakan yang diakibatkan kelalaian wajib dilaporkan kepada Departemen IT/Aset.\n3. Aset hanya digunakan untuk kepentingan kedinasan PT Solusi Teknologi Nusantara.\n4. Apabila terjadi pemutusan hubungan kerja, aset wajib dikembalikan dalam kondisi baik.',
      footerText: 'Demikian Berita Acara Serah Terima Aset ini dibuat dengan sebenarnya dan disetujui oleh kedua belah pihak.',
      signatureTitle1: 'PIHAK PERTAMA (PENYERAH)',
      signatureName1: 'Budi Wicaksono, S.Kom.',
      signatureTitle2: 'PIHAK KEDUA (PENERIMA)',
      signatureName2: '[Nama Karyawan]',
      isDefault: true,
    },
    {
      type: 'PENGEMBALIAN',
      title: 'BERITA ACARA PENGEMBALIAN ASET',
      headerText: 'Pada hari ini, telah dilakukan pengembalian aset inventaris perusahaan kepada Departemen Manajemen Aset antara:',
      termsAndConditions: '1. Seluruh aset telah diperiksa kelengkapan fisik, fungsi, dan aksesoris penunjang.\n2. Data kedinasan dan akses akun perusahaan telah diamankan / dibackup sesuai prosedur IT Security.\n3. Hak guna karyawan atas aset tersebut dinyatakan selesai per tanggal penandatanganan dokumen ini.',
      footerText: 'Demikian Berita Acara Pengembalian Aset ini dibuat untuk dipergunakan sebagaimana mestinya.',
      signatureTitle1: 'PIHAK PERTAMA (PENERIMA / IT ASET)',
      signatureName1: 'Budi Wicaksono, S.Kom.',
      signatureTitle2: 'PIHAK KEDUA (YANG MENYERAHKAN)',
      signatureName2: '[Nama Karyawan]',
      isDefault: true,
    },
    {
      type: 'PENSIUN',
      title: 'BERITA ACARA PENYELESAIAN ASET KARYAWAN PENSIUN',
      headerText: 'Sehubungan dengan purna tugas (pensiun) karyawan yang bersangkutan, telah dilakukan verifikasi dan penyerahan kembali seluruh aset inventaris perusahaan antara:',
      termsAndConditions: '1. Karyawan telah mengembalikan seluruh aset kedinasan tanpa ada tunggakan inventaris.\n2. Perusahaan menyatakan fasilitas inventaris telah lunas dan bebas kewajiban per tanggal purna tugas.\n3. Dokumen ini menjadi syarat sah pencairan hak pensiun dan surat keterangan kerja resmi.',
      footerText: 'Demikian Berita Acara Pensiun ini dibuat rangkap dua bermeterai cukup dan memiliki kekuatan hukum.',
      signatureTitle1: 'MENGETAHUI (HR & ASSET HEAD)',
      signatureName1: 'Siti Rahmawati / Budi Wicaksono',
      signatureTitle2: 'KARYAWAN PURNA TUGAS',
      signatureName2: '[Nama Karyawan]',
      isDefault: true,
    },
    {
      type: 'NON_PENSIUN',
      title: 'BERITA ACARA PENYELESAIAN ASET OFFBOARDING (RESIGN / TERMINASI)',
      headerText: 'Sehubungan dengan berakhirnya hubungan kerja (Resign / Berakhir Kontrak / Mutasi) karyawan, telah dilakukan penyelesaian tanggung jawab aset inventaris perusahaan antara:',
      termsAndConditions: '1. Pihak bersangkutan telah menyelesaikan serah terima seluruh inventaris perusahaan.\n2. Clearance aset telah diverifikasi oleh Tim Asset Management dan IT Security.\n3. Segala kewajiban aset telah tuntas sehingga proses offboarding HR dapat dilanjutkan.',
      footerText: 'Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk proses administrasi offboarding.',
      signatureTitle1: 'TIM CLEARANCE ASSET & HR',
      signatureName1: 'Budi Wicaksono / Siti Rahmawati',
      signatureTitle2: 'KARYAWAN OFFBOARDING',
      signatureName2: '[Nama Karyawan]',
      isDefault: true,
    },
  ];

  for (const tpl of templates) {
    const existing = await prisma.bastTemplate.findFirst({
      where: { companyId, type: tpl.type },
    });
    if (!existing) {
      await prisma.bastTemplate.create({
        data: { ...tpl, companyId },
      });
    }
  }

  // 8. Create Assets
  const assetsData = [
    { assetTag: 'AST-LAP-001', name: 'MacBook Pro 14 M3 Pro', catCode: 'LAP', brand: 'Apple', model: 'A2992 (18GB / 512GB)', sn: 'C02GK998MD6T', price: 34999000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-LAP-002', name: 'Lenovo ThinkPad X1 Carbon Gen 11', catCode: 'LAP', brand: 'Lenovo', model: '21HM0004ID (i7-1365U / 32GB)', sn: 'PF49A821', price: 29500000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-LAP-003', name: 'Dell Latitude 5440 Core i7', catCode: 'LAP', brand: 'Dell', model: 'Latitude 5440 (16GB / 512GB)', sn: '8FJ21X3', price: 21500000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'HR' },
    { assetTag: 'AST-LAP-004', name: 'ASUS ExpertBook B9450', catCode: 'LAP', brand: 'ASUS', model: 'B9450FA (i7 / 16GB)', sn: 'L9N0CV01K234', price: 24000000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-LAP-005', name: 'MacBook Air 15 M2', catCode: 'LAP', brand: 'Apple', model: 'A2941 (16GB / 512GB)', sn: 'C02HY281Q89M', price: 23999000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'MKT' },
    { assetTag: 'AST-LAP-006', name: 'HP EliteBook 840 G10', catCode: 'LAP', brand: 'HP', model: 'EliteBook 840 (i5 / 16GB)', sn: '5CD34298MN', price: 18500000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'FIN' },
    { assetTag: 'AST-MON-001', name: 'Dell UltraSharp 27 4K U2723QE', catCode: 'MON', brand: 'Dell', model: 'U2723QE IPS Black', sn: 'CN-0K791X-74261', price: 8900000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-MON-002', name: 'LG 27UP850N-W 4K UHD', catCode: 'MON', brand: 'LG', model: '27UP850N USB-C HDR', sn: '304NDPK4P129', price: 6800000, condition: 'GOOD', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-MON-003', name: 'Samsung Smart Monitor M8 32"', catCode: 'MON', brand: 'Samsung', model: 'LS32BM801', sn: '0G91HCLU200084', price: 8500000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'MKT' },
    { assetTag: 'AST-PC-001', name: 'Mac Studio M2 Max Workstation', catCode: 'PC', brand: 'Apple', model: 'Mac14,13 (32GB / 1TB)', sn: 'X8W981J09L', price: 42999000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-MOB-001', name: 'iPhone 15 Pro 256GB Titanium', catCode: 'MOB', brand: 'Apple', model: 'A3102 Natural Titanium', sn: 'DN6L0P9Q12', price: 20999000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-MOB-002', name: 'Samsung Galaxy S24 256GB', catCode: 'MOB', brand: 'Samsung', model: 'SM-S921B Onyx Black', sn: 'R5CW31289KJ', price: 13999000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'MKT' },
    { assetTag: 'AST-VEH-001', name: 'Toyota Kijang Innova Zenix V Hybrid', catCode: 'VEH', brand: 'Toyota', model: 'Innova Zenix 2.0 V HV CVT', sn: 'MHFAG4EA1N00098', price: 475000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'WHS-CKR', deptCode: 'OPS' },
    { assetTag: 'AST-VEH-002', name: 'Honda Vario 160 CBS Operasional', catCode: 'VEH', brand: 'Honda', model: 'Vario 160cc 2023', sn: 'MH1KF1117PK00213', price: 27500000, condition: 'GOOD', status: 'AVAILABLE', locCode: 'WHS-CKR', deptCode: 'OPS' },
    { assetTag: 'AST-NET-001', name: 'Cisco Catalyst 9200 48-Port PoE+', catCode: 'NET', brand: 'Cisco', model: 'C9200-48P-E', sn: 'FCW2345A1B2', price: 54000000, condition: 'GOOD', status: 'IN_USE', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-NET-002', name: 'Fortinet FortiGate 100F Firewall', catCode: 'NET', brand: 'Fortinet', model: 'FG-100F-BDL', sn: 'FGT100FT2200192', price: 68000000, condition: 'EXCELLENT', status: 'IN_USE', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-FUR-001', name: 'Herman Miller Aeron Chair Graphite', catCode: 'FUR', brand: 'Herman Miller', model: 'Aeron Size B Full Spec', sn: 'AER-2023-0912', price: 24500000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-LAP-007', name: 'Lenovo ThinkPad T14 Gen 2 (Layar Retak)', catCode: 'LAP', brand: 'Lenovo', model: '20W0004UID', sn: 'PF2K8891', price: 16000000, condition: 'DAMAGED', status: 'MAINTENANCE', locCode: 'HQ-JKT', deptCode: 'IT' },
    { assetTag: 'AST-PC-002', name: 'Dell OptiPlex 7010 Micro', catCode: 'PC', brand: 'Dell', model: 'OptiPlex 7010 (i5 / 8GB)', sn: '3KR89X1', price: 11000000, condition: 'FAIR', status: 'RETIRED', locCode: 'WHS-CKR', deptCode: 'OPS' },
    { assetTag: 'AST-LAP-008', name: 'Dell Latitude 3410 Bekas Rusak Mesin', catCode: 'LAP', brand: 'Dell', model: 'Latitude 3410', sn: '1X998B2', price: 9500000, condition: 'DAMAGED', status: 'DISPOSED', locCode: 'WHS-CKR', deptCode: 'IT' },
  ];

  const assetMap = {};
  for (const ast of assetsData) {
    const a = await prisma.asset.upsert({
      where: { companyId_assetTag: { companyId, assetTag: ast.assetTag } },
      update: {},
      create: {
        companyId,
        assetTag: ast.assetTag,
        name: ast.name,
        categoryId: catMap[ast.catCode],
        brand: ast.brand,
        model: ast.model,
        serialNumber: ast.sn,
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: ast.price,
        warrantyExpDate: new Date('2026-01-15'),
        locationId: locMap[ast.locCode],
        departmentId: deptMap[ast.deptCode],
        condition: ast.condition,
        status: ast.status,
        qrCode: `ASSETFLOW:${ast.assetTag}:${ast.sn}`,
      },
    });
    assetMap[ast.assetTag] = a;
  }

  // 9. Create Active Assignments and Corresponding BAST Documents
  // Assignment 1: Dimas Pratama (MacBook Pro + Dell Monitor)
  const empDimas = await prisma.employee.findUnique({ where: { companyId_nik: { companyId, nik: 'EMP-2023-003' } } });
  const astMacBook = assetMap['AST-LAP-001'];
  const astMonitor = assetMap['AST-MON-001'];

  const bast1 = await prisma.bastDocument.create({
    data: {
      companyId,
      documentNumber: 'BAST/PEN/2024/01/0001',
      type: 'PENYERAHAN',
      title: 'BERITA ACARA SERAH TERIMA ASET PENYERAHAN',
      date: new Date('2024-01-15'),
      employeeId: empDimas.id,
      issuerName: 'Budi Wicaksono, S.Kom.',
      issuerPosition: 'IT Asset & Infrastructure Lead',
      issuerDepartment: 'Information & Technology',
      recipientName: empDimas.fullName,
      recipientNik: empDimas.nik,
      recipientPosition: empDimas.position,
      recipientDepartment: 'Information & Technology',
      status: 'FINAL',
      notes: 'Penyerahan laptop kerja utama dan monitor penunjang pengembangan software.',
      items: {
        create: [
          {
            assetId: astMacBook.id,
            assetTag: astMacBook.assetTag,
            assetName: astMacBook.name,
            brand: astMacBook.brand,
            model: astMacBook.model,
            serialNumber: astMacBook.serialNumber,
            condition: 'EXCELLENT',
            notes: 'Lengkap dengan charger MagSafe 70W dan box orisinil',
            accessories: 'Charger MagSafe 70W, USB-C Cable, Laptop Sleeve',
          },
          {
            assetId: astMonitor.id,
            assetTag: astMonitor.assetTag,
            assetName: astMonitor.name,
            brand: astMonitor.brand,
            model: astMonitor.model,
            serialNumber: astMonitor.serialNumber,
            condition: 'EXCELLENT',
            notes: 'Lengkap dengan kabel USB-C upstream dan kabel Power',
            accessories: 'Kabel USB-C, Kabel DisplayPort, Stand Orisinil',
          },
        ],
      },
    },
  });

  await prisma.assetAssignment.create({
    data: {
      companyId,
      assetId: astMacBook.id,
      employeeId: empDimas.id,
      checkoutDate: new Date('2024-01-15'),
      checkoutCondition: 'EXCELLENT',
      checkoutNotes: 'Penyerahan laptop pengembangan utama',
      accessories: 'Charger 70W, USB-C Cable, Sleeve',
      status: 'ACTIVE',
      checkoutBastId: bast1.id,
    },
  });

  await prisma.assetAssignment.create({
    data: {
      companyId,
      assetId: astMonitor.id,
      employeeId: empDimas.id,
      checkoutDate: new Date('2024-01-15'),
      checkoutCondition: 'EXCELLENT',
      checkoutNotes: 'Penyerahan monitor 4K penunjang',
      accessories: 'USB-C Cable, DP Cable, Stand',
      status: 'ACTIVE',
      checkoutBastId: bast1.id,
    },
  });

  // Assignment 2: Suwandi Kusuma (Toyota Zenix Hybrid)
  const empSuwandi = await prisma.employee.findUnique({ where: { companyId_nik: { companyId, nik: 'EMP-2021-010' } } });
  const astCar = assetMap['AST-VEH-001'];

  const bast2 = await prisma.bastDocument.create({
    data: {
      companyId,
      documentNumber: 'BAST/PEN/2024/02/0002',
      type: 'PENYERAHAN',
      title: 'BERITA ACARA SERAH TERIMA KENDARAAN DINAS',
      date: new Date('2024-02-01'),
      employeeId: empSuwandi.id,
      issuerName: 'Budi Wicaksono, S.Kom.',
      issuerPosition: 'IT Asset & Infrastructure Lead',
      issuerDepartment: 'Information & Technology',
      recipientName: empSuwandi.fullName,
      recipientNik: empSuwandi.nik,
      recipientPosition: empSuwandi.position,
      recipientDepartment: 'Operations & Logistics',
      status: 'FINAL',
      notes: 'Penyerahan kendaraan dinas operasional lapangan.',
      items: {
        create: [
          {
            assetId: astCar.id,
            assetTag: astCar.assetTag,
            assetName: astCar.name,
            brand: astCar.brand,
            model: astCar.model,
            serialNumber: astCar.serialNumber,
            condition: 'EXCELLENT',
            notes: 'STNK Asli, Kunci Kontak 2 pcs, Ban Serep, Dongkrak',
            accessories: 'Kunci Kontak 2 pcs, STNK, Buku Manual, Ban Cadangan',
          },
        ],
      },
    },
  });

  await prisma.assetAssignment.create({
    data: {
      companyId,
      assetId: astCar.id,
      employeeId: empSuwandi.id,
      checkoutDate: new Date('2024-02-01'),
      checkoutCondition: 'EXCELLENT',
      checkoutNotes: 'Kendaraan dinas operasional divisi logistik',
      accessories: 'Kunci Kontak 2 pcs, STNK, Ban Cadangan',
      status: 'ACTIVE',
      checkoutBastId: bast2.id,
    },
  });

  // Assignment 3: Anisa Larasati (MacBook Air 15 M2 + Monitor)
  const empAnisa = await prisma.employee.findUnique({ where: { companyId_nik: { companyId, nik: 'EMP-2023-004' } } });
  const astMacAir = assetMap['AST-LAP-005'];
  const astSamsung = assetMap['AST-MON-003'];

  const bast3 = await prisma.bastDocument.create({
    data: {
      companyId,
      documentNumber: 'BAST/PEN/2024/03/0003',
      type: 'PENYERAHAN',
      title: 'BERITA ACARA SERAH TERIMA ASET KANTOR BANDUNG',
      date: new Date('2024-03-10'),
      employeeId: empAnisa.id,
      issuerName: 'Budi Wicaksono, S.Kom.',
      issuerPosition: 'IT Asset & Infrastructure Lead',
      issuerDepartment: 'Information & Technology',
      recipientName: empAnisa.fullName,
      recipientNik: empAnisa.nik,
      recipientPosition: empAnisa.position,
      recipientDepartment: 'Sales & Marketing',
      status: 'FINAL',
      notes: 'Fasilitas laptop dan smart monitor tim creative marketing Bandung.',
      items: {
        create: [
          {
            assetId: astMacAir.id,
            assetTag: astMacAir.assetTag,
            assetName: astMacAir.name,
            brand: astMacAir.brand,
            model: astMacAir.model,
            serialNumber: astMacAir.serialNumber,
            condition: 'GOOD',
            notes: 'Kondisi mulus, charger adaptor 35W dual port',
            accessories: 'Charger 35W Dual Port, MagSafe Cable',
          },
        ],
      },
    },
  });

  await prisma.assetAssignment.create({
    data: {
      companyId,
      assetId: astMacAir.id,
      employeeId: empAnisa.id,
      checkoutDate: new Date('2024-03-10'),
      checkoutCondition: 'GOOD',
      accessories: 'Charger 35W Dual Port, MagSafe Cable',
      status: 'ACTIVE',
      checkoutBastId: bast3.id,
    },
  });

  await prisma.assetAssignment.create({
    data: {
      companyId,
      assetId: astSamsung.id,
      employeeId: empAnisa.id,
      checkoutDate: new Date('2024-03-10'),
      checkoutCondition: 'GOOD',
      accessories: 'Power Adapter, Remote Control, Stand',
      status: 'ACTIVE',
      checkoutBastId: bast3.id,
    },
  });

  // 10. Create Recorded Asset Transactions & Audit Logs
  await prisma.assetTransaction.create({
    data: {
      companyId,
      transactionNumber: 'TRX-2024-01-0001',
      type: 'CHECKOUT',
      assetId: astMacBook.id,
      toEmployeeId: empDimas.id,
      date: new Date('2024-01-15'),
      condition: 'EXCELLENT',
      notes: 'Penyerahan awal laptop ke Dimas Pratama',
      performedById: userMap['ADMIN_ASSET'],
      bastDocumentId: bast1.id,
    },
  });

  await prisma.assetTransaction.create({
    data: {
      companyId,
      transactionNumber: 'TRX-2024-02-0002',
      type: 'CHECKOUT',
      assetId: astCar.id,
      toEmployeeId: empSuwandi.id,
      date: new Date('2024-02-01'),
      condition: 'EXCELLENT',
      notes: 'Penyerahan kendaraan dinas operasional Cikarang',
      performedById: userMap['ADMIN_ASSET'],
      bastDocumentId: bast2.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      companyId,
      userId: userMap['ADMIN_ASSET'],
      action: 'SYSTEM_INITIALIZATION',
      entity: 'COMPANY',
      entityId: companyId,
      newState: JSON.stringify({ name: company.name, code: company.code }),
      ipAddress: '127.0.0.1',
      userAgent: 'AssetFlow Seeder Agent',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
