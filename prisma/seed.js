const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AssetFlow with Pure Enterprise IT Assets...');

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
      signatureTitle1: 'PIHAK PERTAMA (HEAD OF IT INFRASTRUCTURE)',
      signatureName1: 'Budi Wicaksono, S.Kom.',
      signatureTitle2: 'PIHAK KEDUA (PENERIMA / KARYAWAN)',
      signatureName2: 'Karyawan Bersangkutan',
    },
  });

  const companyId = company.id;

  // 2. Create Departments
  const departmentsData = [
    { code: 'ENG', name: 'Software Engineering', description: 'Divisi Software Development, Backend, Frontend & Mobile', managerName: 'Dimas Pratama' },
    { code: 'INF', name: 'IT Infrastructure & DevOps', description: 'Divisi Server, Cloud, Jaringan, dan IT Support', managerName: 'Budi Wicaksono' },
    { code: 'PRD', name: 'Product & Design', description: 'Divisi UI/UX, Product Management & Research', managerName: 'Anisa Larasati' },
    { code: 'FIN', name: 'Finance & Accounting', description: 'Divisi Keuangan, Akuntansi, dan Pajak', managerName: 'Maya Indriani' },
    { code: 'OPS', name: 'Operations & Corporate HR', description: 'Divisi HR, Operasional Kantor dan General Affairs', managerName: 'Siti Rahmawati' },
  ];

  const deptMap = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { companyId_code: { companyId, code: dept.code } },
      update: { name: dept.name, description: dept.description },
      create: { ...dept, companyId },
    });
    deptMap[dept.code] = d.id;
  }

  // 3. Create Locations (IT Campus & Data Centers)
  const locationsData = [
    { code: 'HQ-JKT', name: 'Cyber 2 Head Office Jakarta', building: 'Cyber 2 Tower', floor: 'Lantai 18', room: 'IT Staging & Server Room', description: 'Pusat server dan ruang kerja IT' },
    { code: 'DC-TGR', name: 'Data Center Tangerang', building: 'Equinix Data Center', floor: 'Lantai 2', room: 'Rack A-04', description: 'Primary Server & Core Network Facility' },
    { code: 'BR-BDG', name: 'Bandung Tech Hub', building: 'Dago Digital Building', floor: 'Lantai 3', room: 'Engineering Hall', description: 'Software Engineering Hub' },
    { code: 'BR-SBY', name: 'Surabaya Regional Office', building: 'Intiland Tower', floor: 'Lantai 8', room: 'Tech Suite 802', description: 'Regional Support & Tech Lab' },
  ];

  const locMap = {};
  for (const loc of locationsData) {
    const l = await prisma.assetLocation.upsert({
      where: { companyId_code: { companyId, code: loc.code } },
      update: { name: loc.name, description: loc.description },
      create: { ...loc, companyId },
    });
    locMap[loc.code] = l.id;
  }

  // 4. Create Pure IT Categories
  const categoriesData = [
    { code: 'LAP', name: 'Laptop & MacBook', prefix: 'AST-LPT', icon: 'Laptop', description: 'Laptop developer, MacBook Pro, ThinkPad untuk mobilitas kerja' },
    { code: 'PC', name: 'PC Desktop & Workstation', prefix: 'AST-WKS', icon: 'Monitor', description: 'Workstation komputasi tinggi, Mac Studio & desktop developer' },
    { code: 'SWT', name: 'Network Switch', prefix: 'AST-SWT', icon: 'Network', description: 'Managed switch Cisco, UniFi PoE, Aruba core & access switch' },
    { code: 'AP', name: 'Wireless Access Point', prefix: 'AST-WAP', icon: 'Wifi', description: 'Wi-Fi 6E/7 Access Point UniFi, Cisco Catalyst, Aruba enterprise' },
    { code: 'SRV', name: 'Server & Storage', prefix: 'AST-SRV', icon: 'Server', description: 'Rackmount server Dell PowerEdge, Synology NAS storage enterprise' },
    { code: 'MON', name: 'Monitor & Display IT', prefix: 'AST-MON', icon: 'Tv', description: 'Monitor profesional 4K Dell UltraSharp, LG UltraWide USB-C' },
    { code: 'SEC', name: 'Firewall & Router', prefix: 'AST-RTR', icon: 'Shield', description: 'Next-Gen Firewall FortiGate, Core Router MikroTik' },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.assetCategory.upsert({
      where: { companyId_code: { companyId, code: cat.code } },
      update: { name: cat.name, prefix: cat.prefix, icon: cat.icon, description: cat.description },
      create: { ...cat, companyId },
    });
    catMap[cat.code] = c.id;
  }

  // 5. Create Employees
  const employeesData = [
    { nik: 'EMP-2022-001', fullName: 'Budi Wicaksono', email: 'budi.wicaksono@solusinusantara.co.id', phone: '081234567801', deptCode: 'INF', position: 'IT Infrastructure & Security Lead', status: 'PERMANENT', joinDate: new Date('2022-01-10'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2022-002', fullName: 'Siti Rahmawati', email: 'siti.rahmawati@solusinusantara.co.id', phone: '081234567802', deptCode: 'OPS', position: 'Head of People & Operations', status: 'PERMANENT', joinDate: new Date('2022-02-15'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2023-003', fullName: 'Dimas Pratama', email: 'dimas.pratama@solusinusantara.co.id', phone: '081234567803', deptCode: 'ENG', position: 'Principal Software Architect', status: 'PERMANENT', joinDate: new Date('2023-03-01'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2023-004', fullName: 'Anisa Larasati', email: 'anisa.larasati@solusinusantara.co.id', phone: '081234567804', deptCode: 'PRD', position: 'Lead Product Designer', status: 'PERMANENT', joinDate: new Date('2023-05-15'), locCode: 'BR-BDG' },
    { nik: 'EMP-2023-005', fullName: 'Fajar Nugroho', email: 'fajar.nugroho@solusinusantara.co.id', phone: '081234567805', deptCode: 'FIN', position: 'Finance & Budget Controller', status: 'PERMANENT', joinDate: new Date('2023-06-20'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-006', fullName: 'Rizky Kurniawan', email: 'rizky.kurniawan@solusinusantara.co.id', phone: '081234567806', deptCode: 'INF', position: 'Senior Network & DevOps Engineer', status: 'PERMANENT', joinDate: new Date('2024-01-08'), locCode: 'DC-TGR' },
    { nik: 'EMP-2024-007', fullName: 'Aditya Wirawan', email: 'aditya.wirawan@solusinusantara.co.id', phone: '081234567807', deptCode: 'ENG', position: 'Senior Backend Developer', status: 'PERMANENT', joinDate: new Date('2024-02-01'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-008', fullName: 'Hendro Prasetyo', email: 'hendro.prasetyo@solusinusantara.co.id', phone: '081234567808', deptCode: 'FIN', position: 'Internal IT Auditor', status: 'PERMANENT', joinDate: new Date('2024-03-15'), locCode: 'HQ-JKT' },
    { nik: 'EMP-2024-009', fullName: 'Gita Permata', email: 'gita.permata@solusinusantara.co.id', phone: '081234567809', deptCode: 'PRD', position: 'Product Operations Specialist', status: 'CONTRACT', joinDate: new Date('2024-04-01'), locCode: 'BR-SBY' },
    { nik: 'EMP-2024-010', fullName: 'Farhan Maulana', email: 'farhan.maulana@solusinusantara.co.id', phone: '081234567810', deptCode: 'ENG', position: 'Frontend Engineer', status: 'PERMANENT', joinDate: new Date('2024-05-10'), locCode: 'BR-BDG' },
  ];

  const empMap = {};
  for (const emp of employeesData) {
    const e = await prisma.employee.upsert({
      where: { companyId_nik: { companyId, nik: emp.nik } },
      update: {
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        departmentId: deptMap[emp.deptCode],
        position: emp.position,
        employmentStatus: emp.status,
        locationId: locMap[emp.locCode],
      },
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

  let adminUserId = null;
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, employeeId: u.employeeId },
      create: {
        companyId,
        email: u.email,
        name: u.name,
        password: passwordHash,
        role: u.role,
        employeeId: u.employeeId,
      },
    });
    if (u.role === 'ADMIN_ASSET') adminUserId = user.id;
  }

  // 7. Clean up non-IT assets from older seed if any
  await prisma.bastDocumentItem.deleteMany({ where: { asset: { companyId } } });
  await prisma.assetTransaction.deleteMany({ where: { companyId } });
  await prisma.assetAssignment.deleteMany({ where: { companyId } });
  await prisma.bastDocument.deleteMany({ where: { companyId } });
  await prisma.asset.deleteMany({ where: { companyId } });

  // 8. Create Pure IT Assets (Laptops, PC Workstations, Switches, Access Points, Servers, Displays, Firewalls)
  const itAssetsData = [
    // LAPTOPS (6 units)
    { assetTag: 'AST-LPT-001', name: 'MacBook Pro 16 M3 Max (64GB / 1TB)', catCode: 'LAP', brand: 'Apple', model: 'MacBookPro18,2 (Space Black)', sn: 'C02GK998MD6T', price: 54999000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'ENG', empNik: 'EMP-2023-003' },
    { assetTag: 'AST-LPT-002', name: 'Lenovo ThinkPad X1 Carbon Gen 11 (32GB / 1TB)', catCode: 'LAP', brand: 'Lenovo', model: '21HM0004ID (i7-1365U)', sn: 'PF49A821-X1C', price: 31500000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: 'EMP-2022-001' },
    { assetTag: 'AST-LPT-003', name: 'Dell Latitude 5440 Core i7 (16GB / 512GB)', catCode: 'LAP', brand: 'Dell', model: 'Latitude 5440 vPro', sn: '8FJ21X3-LAT', price: 21500000, condition: 'GOOD', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'FIN', empNik: 'EMP-2023-005' },
    { assetTag: 'AST-LPT-004', name: 'MacBook Air 15 M2 (16GB / 512GB)', catCode: 'LAP', brand: 'Apple', model: 'A2941 Starlight', sn: 'C02HY281Q89M', price: 23999000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'PRD', empNik: 'EMP-2023-004' },
    { assetTag: 'AST-LPT-005', name: 'ASUS ExpertBook B9450 Ultra-Light (16GB)', catCode: 'LAP', brand: 'ASUS', model: 'B9450FA-BM0128R', sn: 'L9N0CV01K234', price: 22000000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },
    { assetTag: 'AST-LPT-006', name: 'Lenovo ThinkPad T14 Gen 4 (AMD Ryzen 7)', catCode: 'LAP', brand: 'Lenovo', model: '21HD0011ID', sn: 'PF3M7721-T14', price: 24500000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },

    // PC WORKSTATIONS (4 units)
    { assetTag: 'AST-WKS-001', name: 'Apple Mac Studio M2 Max (32GB / 1TB SSD)', catCode: 'PC', brand: 'Apple', model: 'Mac14,13 Studio Workstation', sn: 'X8W981J09L', price: 42999000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'ENG', empNik: 'EMP-2024-007' },
    { assetTag: 'AST-WKS-002', name: 'Dell Precision 3660 Workstation (i9 / 64GB / RTX A4000)', catCode: 'PC', brand: 'Dell', model: 'Precision 3660 Tower', sn: 'DP3660-8812A', price: 58000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'ENG', empNik: 'EMP-2024-010' },
    { assetTag: 'AST-WKS-003', name: 'HP Z2 Mini G9 Workstation (i7 / 32GB)', catCode: 'PC', brand: 'HP', model: 'Z2 Mini G9 Compact', sn: '5CD99281MZ', price: 32000000, condition: 'GOOD', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },
    { assetTag: 'AST-WKS-004', name: 'Lenovo ThinkCentre M70q Tiny PC', catCode: 'PC', brand: 'Lenovo', model: 'M70q Gen 3 Tiny', sn: 'MJ0911XA', price: 14500000, condition: 'FAIR', status: 'MAINTENANCE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },

    // NETWORK SWITCHES (4 units)
    { assetTag: 'AST-SWT-001', name: 'Cisco Catalyst 9200L 48-Port PoE+ Managed Switch', catCode: 'SWT', brand: 'Cisco', model: 'C9200L-48P-4X-E', sn: 'FCW2438B01K', price: 62000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: 'EMP-2024-006' },
    { assetTag: 'AST-SWT-002', name: 'Ubiquiti UniFi Pro Max 24 PoE Layer 3 Switch', catCode: 'SWT', brand: 'Ubiquiti', model: 'USW-Pro-Max-24-PoE', sn: '70A741A9901B', price: 16500000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'INF', empNik: 'EMP-2022-001' },
    { assetTag: 'AST-SWT-003', name: 'Aruba CX 6100 24G 4SFP+ Campus Switch', catCode: 'SWT', brand: 'Aruba Networks', model: 'JL678A 24G Class4 PoE', sn: 'CN21H9X014', price: 23000000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'DC-TGR', deptCode: 'INF', empNik: null },
    { assetTag: 'AST-SWT-004', name: 'Cisco Catalyst 2960-X 24 GigE (Legacy Backup)', catCode: 'SWT', brand: 'Cisco', model: 'WS-C2960X-24TS-L', sn: 'FOC1842S091', price: 18000000, condition: 'FAIR', status: 'RETIRED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },

    // ACCESS POINTS (4 units)
    { assetTag: 'AST-WAP-001', name: 'Ubiquiti UniFi U6 Enterprise Wi-Fi 6E AP', catCode: 'AP', brand: 'Ubiquiti', model: 'U6-Enterprise (10.2 Gbps)', sn: '602232E90123', price: 6200000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: 'EMP-2024-006' },
    { assetTag: 'AST-WAP-002', name: 'Ubiquiti UniFi U6 Pro Access Point', catCode: 'AP', brand: 'Ubiquiti', model: 'U6-Pro Dual-Band Wi-Fi 6', sn: '602232F81204', price: 3400000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'BR-BDG', deptCode: 'INF', empNik: 'EMP-2022-001' },
    { assetTag: 'AST-WAP-003', name: 'Cisco Catalyst 9120AX Series Wi-Fi 6 AP', catCode: 'AP', brand: 'Cisco', model: 'C9120AXI-E', sn: 'FOC23199AB1', price: 14500000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },
    { assetTag: 'AST-WAP-004', name: 'Aruba AP-515 Campus Access Point (Unified)', catCode: 'AP', brand: 'Aruba Networks', model: 'Q9H62A AP-515', sn: 'CN98KM7720', price: 11500000, condition: 'GOOD', status: 'AVAILABLE', locCode: 'BR-SBY', deptCode: 'INF', empNik: null },

    // SERVERS & STORAGE (3 units)
    { assetTag: 'AST-SRV-001', name: 'Dell PowerEdge R760 2U Rackmount Server', catCode: 'SRV', brand: 'Dell', model: 'R760 (Dual Xeon Silver / 128GB / 8TB SAS)', sn: '98R760-SRV01', price: 145000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'DC-TGR', deptCode: 'INF', empNik: 'EMP-2024-006' },
    { assetTag: 'AST-SRV-002', name: 'Synology RackStation RS2423+ Enterprise NAS (48TB)', catCode: 'SRV', brand: 'Synology', model: 'RS2423+ 12-Bay Storage', sn: '2280SRN09812', price: 48000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: 'EMP-2022-001' },
    { assetTag: 'AST-SRV-003', name: 'HPE ProLiant DL380 Gen10 Server (Staging)', catCode: 'SRV', brand: 'HPE', model: 'DL380 Gen10 8SFF', sn: 'SGH9110ABC', price: 85000000, condition: 'GOOD', status: 'AVAILABLE', locCode: 'DC-TGR', deptCode: 'INF', empNik: null },

    // MONITORS IT (3 units)
    { assetTag: 'AST-MON-001', name: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)', catCode: 'MON', brand: 'Dell', model: 'U2723QE IPS Black', sn: 'CN-0K791X-74261', price: 9200000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'ENG', empNik: 'EMP-2023-003' },
    { assetTag: 'AST-MON-002', name: 'LG 34 UltraWide Curved USB-C (34WP85C-B)', catCode: 'MON', brand: 'LG', model: '34WP85C-B QHD IPS', sn: '304NDPK4P129', price: 11500000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'PRD', empNik: 'EMP-2023-004' },
    { assetTag: 'AST-MON-003', name: 'Dell UltraSharp 24 InfinityEdge (U2422H)', catCode: 'MON', brand: 'Dell', model: 'U2422H Full HD IPS', sn: 'CN-0H991B-12891', price: 4200000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'HQ-JKT', deptCode: 'INF', empNik: null },

    // FIREWALL & ROUTER (2 units)
    { assetTag: 'AST-RTR-001', name: 'Fortinet FortiGate 100F Enterprise Next-Gen Firewall', catCode: 'SEC', brand: 'Fortinet', model: 'FG-100F-BDL-950', sn: 'FGT100FT2200192', price: 68000000, condition: 'EXCELLENT', status: 'ASSIGNED', locCode: 'HQ-JKT', deptCode: 'INF', empNik: 'EMP-2024-006' },
    { assetTag: 'AST-RTR-002', name: 'MikroTik Cloud Core Router CCR2004-16G-2S+', catCode: 'SEC', brand: 'MikroTik', model: 'CCR2004-16G-2S+PC', sn: 'HE91002981BC', price: 9500000, condition: 'EXCELLENT', status: 'AVAILABLE', locCode: 'DC-TGR', deptCode: 'INF', empNik: null },
  ];

  console.log(`Creating ${itAssetsData.length} pure IT enterprise assets...`);

  let bastCount = 1;
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  for (const ast of itAssetsData) {
    const asset = await prisma.asset.create({
      data: {
        companyId,
        assetTag: ast.assetTag,
        name: ast.name,
        categoryId: catMap[ast.catCode],
        brand: ast.brand,
        model: ast.model,
        serialNumber: ast.sn,
        purchaseDate: new Date('2023-08-15'),
        purchasePrice: ast.price,
        warrantyExpDate: new Date('2026-08-15'),
        condition: ast.condition,
        status: ast.status,
        locationId: locMap[ast.locCode],
        departmentId: deptMap[ast.deptCode],
        notes: `Enterprise IT hardware di ${ast.locCode}`,
      },
    });

    // If ASSIGNED, create active assignment, transaction, and formal BAST Penyerahan
    if (ast.status === 'ASSIGNED' && ast.empNik) {
      const empId = empMap[ast.empNik];
      const emp = employeesData.find(e => e.nik === ast.empNik);

      const txNumber = `TX/IT/OUT/${currentYear}/${currentMonth}/${String(bastCount).padStart(4, '0')}`;
      const docNumber = `BAST/PENYERAHAN/${currentYear}/${currentMonth}/${String(bastCount).padStart(4, '0')}`;

      const bastDoc = await prisma.bastDocument.create({
        data: {
          companyId,
          documentNumber: docNumber,
          type: 'PENYERAHAN',
          status: 'FINAL',
          date: new Date('2024-01-15'),
          employeeId: empId,
          issuerName: company.signatureName1,
          issuerPosition: 'Head of IT Infrastructure',
          issuerDepartment: 'IT Infrastructure',
          recipientName: emp.fullName,
          recipientNik: emp.nik,
          recipientPosition: emp.position,
          recipientDepartment: emp.deptCode,
          title: `BAST Penyerahan Perangkat IT - ${ast.name}`,
          notes: 'Perangkat diserahterimakan dalam kondisi prima lengkap dengan adaptor dan kabel original.',
          items: {
            create: [
              {
                assetId: asset.id,
                assetTag: asset.assetTag,
                assetName: asset.name,
                brand: ast.brand,
                model: ast.model,
                serialNumber: asset.serialNumber,
                condition: asset.condition,
                accessories: 'Adaptor Charger Original, Kabel Power, RJ-45 Patch Cord, Box',
              },
            ],
          },
        },
      });

      const assignment = await prisma.assetAssignment.create({
        data: {
          companyId,
          assetId: asset.id,
          employeeId: empId,
          checkoutDate: new Date('2024-01-15'),
          checkoutCondition: ast.condition,
          checkoutNotes: 'Fasilitas komputasi dan infrastruktur IT resmi perusahaan',
          accessories: 'Adaptor Charger Original, Kabel Power, RJ-45 Patch Cord, Box',
          checkoutBastId: bastDoc.id,
          status: 'ACTIVE',
        },
      });

      await prisma.assetTransaction.create({
        data: {
          companyId,
          transactionNumber: txNumber,
          type: 'CHECKOUT',
          assetId: asset.id,
          toEmployeeId: empId,
          fromLocationId: locMap['HQ-JKT'],
          toLocationId: locMap[ast.locCode],
          condition: ast.condition,
          date: new Date('2024-01-15'),
          notes: `Serah terima IT asset kepada ${emp.fullName}`,
          bastDocumentId: bastDoc.id,
          performedById: adminUserId,
        },
      });

      bastCount++;
    }
  }

  console.log('✅ IT Enterprise Seed successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
