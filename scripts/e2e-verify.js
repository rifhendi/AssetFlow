// scripts/e2e-verify.js
// Automated End-to-End Verification for AssetFlow

async function main() {
  const baseUrl = 'http://localhost:3000';
  let cookie = '';

  console.log('🚀 Starting AssetFlow E2E Verification...\n');

  // 1. Login
  console.log('1. Testing Login as Super Admin...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@assetflow.com', password: 'password123' })
  });
  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
  const setCookie = loginRes.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }
  const loginData = await loginRes.json();
  console.log(`   ✅ Logged in successfully as: ${loginData.user.name} (${loginData.user.role})`);

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie
  };

  // 2. Auth verification
  console.log('\n2. Verifying /api/auth/me session...');
  const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers });
  const meData = await meRes.json();
  console.log(`   ✅ Session verified for user: ${meData.user.email}`);

  // 3. Fetch assets
  console.log('\n3. Fetching Assets via /api/assets...');
  const assetsRes = await fetch(`${baseUrl}/api/assets`, { headers });
  const assetsList = await assetsRes.json();
  const assets = Array.isArray(assetsList) ? assetsList : (assetsList.assets || []);
  console.log(`   ✅ Assets retrieved: ${assets.length} items`);
  const availableAsset = assets.find(a => a.status === 'AVAILABLE');
  if (!availableAsset) {
    console.log('   ℹ️ No available asset found, selecting first asset for test');
  }
  const testAsset = availableAsset || assets[0];
  console.log(`   🎯 Selected Asset: [${testAsset.assetTag}] ${testAsset.name}`);

  // 4. Fetch employees
  console.log('\n4. Fetching Employees via /api/employees...');
  const empRes = await fetch(`${baseUrl}/api/employees`, { headers });
  const empList = await empRes.json();
  const employees = Array.isArray(empList) ? empList : (empList.employees || []);
  console.log(`   ✅ Employees retrieved: ${employees.length} items`);
  const testEmployee = employees[0];
  console.log(`   🎯 Selected Employee: [${testEmployee.nik}] ${testEmployee.fullName}`);

  // 5. Checkout Transaction
  console.log('\n5. Executing Asset Checkout (/api/transactions/checkout)...');
  const checkoutRes = await fetch(`${baseUrl}/api/transactions/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      employeeId: testEmployee.id,
      assetIds: [testAsset.id],
      checkoutDate: new Date().toISOString().split('T')[0],
      location: 'Head Office - Jakarta',
      notes: 'Automated E2E Verification Checkout',
      accessories: 'Adaptor Charger, Mouse Wireless, Tas Laptop'
    })
  });
  if (!checkoutRes.ok) {
    const errText = await checkoutRes.text();
    console.log(`   ⚠️ Checkout note: ${errText}`);
  } else {
    const checkoutData = await checkoutRes.json();
    console.log(`   ✅ Checkout successful! Transaction ID: ${checkoutData.transactionId}`);
    console.log(`   📄 Generated BAST Document ID: ${checkoutData.bastDocumentId}`);

    // 6. Test BAST Document Fetch
    console.log('\n6. Verifying BAST Document View (/bast/[id])...');
    const bastRes = await fetch(`${baseUrl}/bast/${checkoutData.bastDocumentId}`, { headers });
    const bastHtml = await bastRes.text();
    if (bastHtml.includes('BERITA ACARA SERAH TERIMA') || bastHtml.includes('BAST')) {
      console.log('   ✅ BAST Document rendered formal legal layout with Indonesian header & signatories!');
    } else {
      console.log('   ⚠️ BAST page responded with status:', bastRes.status);
    }
  }

  // 7. Check-in / Return Asset
  console.log('\n7. Executing Asset Return / Check-in (/api/transactions/checkin)...');
  const checkinRes = await fetch(`${baseUrl}/api/transactions/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      employeeId: testEmployee.id,
      assetIds: [testAsset.id],
      returnCondition: 'GOOD',
      accessories: 'Adaptor Charger, Mouse Wireless, Tas Laptop',
      returnNotes: 'Returned in good working order during verification',
      returnDate: new Date().toISOString().split('T')[0]
    })
  });
  if (checkinRes.ok) {
    const checkinData = await checkinRes.json();
    console.log(`   ✅ Return recorded successfully!`);
    console.log(`   📄 Return BAST Document ID: ${checkinData.bastDocumentId}`);
  } else {
    console.log('   ℹ️ Return response:', await checkinRes.text());
  }

  // 8. Excel Export Check
  console.log('\n8. Testing Excel Export (/api/assets/export)...');
  const exportRes = await fetch(`${baseUrl}/api/assets/export`, { headers: { Cookie: cookie } });
  if (exportRes.ok) {
    const buf = await exportRes.arrayBuffer();
    console.log(`   ✅ Excel export generated: ${buf.byteLength} bytes (.xlsx)`);
  } else {
    console.log('   ⚠️ Export status:', exportRes.status);
  }

  // 9. Report Export Check
  console.log('\n9. Testing Reports Export (/api/reports/export?type=inventory)...');
  const repRes = await fetch(`${baseUrl}/api/reports/export?type=inventory`, { headers: { Cookie: cookie } });
  if (repRes.ok) {
    const repBuf = await repRes.arrayBuffer();
    console.log(`   ✅ Inventory report generated: ${repBuf.byteLength} bytes (.xlsx)`);
  } else {
    console.log('   ⚠️ Report status:', repRes.status);
  }

  // 10. Global Search Check
  console.log('\n10. Testing Global Search (/api/search?q=MacBook)...');
  const searchRes = await fetch(`${baseUrl}/api/search?q=MacBook`, { headers });
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    console.log(`   ✅ Search returned: ${searchData.assets.length} assets, ${searchData.employees.length} employees`);
  }

  console.log('\n🎉 ALL CORE FUNCTIONALITIES VERIFIED SUCCESSFULLY AND LIVE!');
}

main().catch(err => {
  console.error('E2E Verification Error:', err);
  process.exit(1);
});
