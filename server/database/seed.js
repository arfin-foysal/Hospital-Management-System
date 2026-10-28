const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function seed() {
  console.log('🌱 Starting CareSync HMS database seed via Prisma ORM...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const docHash = await bcrypt.hash('doctor123', 10);
  const recepHash = await bcrypt.hash('reception123', 10);
  const pharmaHash = await bcrypt.hash('pharma123', 10);
  const labHash = await bcrypt.hash('lab123', 10);
  const accHash = await bcrypt.hash('account123', 10);
  const ptHash = await bcrypt.hash('patient123', 10);

  // 1. Seed Users
  const usersData = [
    { name: 'Dr. Arthur Pendelton (Admin)', email: 'admin@hospital.com', password: passwordHash, role: 'admin', phone: '+1 555-010-0001' },
    { name: 'Dr. Sarah Jenkins', email: 'doctor@hospital.com', password: docHash, role: 'doctor', phone: '+1 555-010-0002' },
    { name: 'Dr. Marcus Vance', email: 'doctor2@hospital.com', password: docHash, role: 'doctor', phone: '+1 555-010-0003' },
    { name: 'Maria Gomez', email: 'receptionist@hospital.com', password: recepHash, role: 'receptionist', phone: '+1 555-010-0005' },
    { name: 'Alex Rahman', email: 'pharmacist@hospital.com', password: pharmaHash, role: 'pharmacist', phone: '+1 555-010-0006' },
    { name: 'David Chen', email: 'labtech@hospital.com', password: labHash, role: 'lab_technician', phone: '+1 555-010-0007' },
    { name: 'Fatima Begum', email: 'accountant@hospital.com', password: accHash, role: 'accountant', phone: '+1 555-010-0008' },
    { name: 'John Doe', email: 'patient@hospital.com', password: ptHash, role: 'patient', phone: '+1 555-010-0009' },
  ];

  for (const u of usersData) {
    const existing = await prisma.users.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.users.create({ data: u });
      console.log(`  ✅ Created user: ${u.email} (${u.role})`);
    }
  }

  // 2. Seed Lab Tests Catalog
  const labCatalogData = [
    { test_code: 'LAB-CBC', test_name: 'Complete Blood Count (CBC)', category: 'Hematology', standard_charge: 25.00, normal_range: 'WBC: 4.5-11.0, RBC: 4.3-5.9', unit: 'x10^3/uL', turnaround_time: '12 Hours' },
    { test_code: 'LAB-FBS', test_name: 'Fasting Blood Glucose (FBS)', category: 'Biochemistry', standard_charge: 15.00, normal_range: '70 - 100', unit: 'mg/dL', turnaround_time: '6 Hours' },
    { test_code: 'LAB-LIPID', test_name: 'Lipid Profile Screen', category: 'Biochemistry', standard_charge: 40.00, normal_range: 'Cholesterol < 200, HDL > 40', unit: 'mg/dL', turnaround_time: '24 Hours' },
    { test_code: 'LAB-XRAY', test_name: 'Chest X-Ray (PA View)', category: 'Radiology', standard_charge: 50.00, normal_range: 'Clear lung fields, normal cardiothoracic ratio', unit: 'Film', turnaround_time: '4 Hours' },
    { test_code: 'LAB-URINE', test_name: 'Urine Routine & Microscopic', category: 'Microbiology', standard_charge: 18.00, normal_range: 'Nil albumin, 0-2 Pus cells', unit: 'HPF', turnaround_time: '12 Hours' },
    { test_code: 'LAB-ELECT', test_name: 'Serum Electrolytes (Na/K/Cl)', category: 'Biochemistry', standard_charge: 35.00, normal_range: 'Na: 135-145, K: 3.5-5.0', unit: 'mmol/L', turnaround_time: '8 Hours' },
  ];

  for (const item of labCatalogData) {
    const existing = await prisma.lab_tests_catalog.findUnique({ where: { test_code: item.test_code } });
    if (!existing) {
      await prisma.lab_tests_catalog.create({ data: item });
      console.log(`  ✅ Created lab test: ${item.test_name}`);
    }
  }

  // 3. Seed Medicines Inventory
  const medicinesData = [
    { name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin Trihydrate', category: 'Capsule', batch_number: 'AMX-2026-01', unit_price: 6.50, purchase_price: 3.80, stock_quantity: 450, reorder_level: 50, expiry_date: new Date('2027-08-15'), manufacturer: 'Square Pharma', location_rack: 'Rack A1' },
    { name: 'Paracetamol 500mg', generic_name: 'Acetaminophen', category: 'Tablet', batch_number: 'PCM-2026-99', unit_price: 2.00, purchase_price: 0.80, stock_quantity: 800, reorder_level: 100, expiry_date: new Date('2028-01-20'), manufacturer: 'Beximco Pharma', location_rack: 'Rack A2' },
    { name: 'Omeprazole 20mg', generic_name: 'Omeprazole', category: 'Capsule', batch_number: 'OMP-2026-03', unit_price: 4.50, purchase_price: 2.20, stock_quantity: 18, reorder_level: 25, expiry_date: new Date('2027-04-10'), manufacturer: 'Incepta Pharma', location_rack: 'Rack B1' },
    { name: 'Normal Saline 0.9% 500ml', generic_name: 'Sodium Chloride IV', category: 'IV_Fluid', batch_number: 'NS-2026-44', unit_price: 8.00, purchase_price: 4.50, stock_quantity: 120, reorder_level: 30, expiry_date: new Date('2027-12-31'), manufacturer: 'Opsonin Pharma', location_rack: 'Fluid Storage Bay 3' },
    { name: 'Ceftriaxone 1g Injection', generic_name: 'Ceftriaxone Sodium', category: 'Injection', batch_number: 'CFT-2026-11', unit_price: 14.00, purchase_price: 8.50, stock_quantity: 65, reorder_level: 20, expiry_date: new Date('2027-05-18'), manufacturer: 'Renata Ltd', location_rack: 'Cold Box 1' },
    { name: 'Azithromycin 500mg', generic_name: 'Azithromycin', category: 'Tablet', batch_number: 'AZT-2026-55', unit_price: 9.50, purchase_price: 5.20, stock_quantity: 12, reorder_level: 20, expiry_date: new Date('2026-12-10'), manufacturer: 'Healthcare Ltd', location_rack: 'Rack B2' }
  ];

  for (const m of medicinesData) {
    const existing = await prisma.medicines.findFirst({ where: { batch_number: m.batch_number } });
    if (!existing) {
      await prisma.medicines.create({ data: m });
      console.log(`  ✅ Created medicine: ${m.name}`);
    }
  }

  // 4. Seed Wards & Beds
  const wardsData = [
    { bed_number: 'ICU-B01', ward_type: 'ICU', floor: '3rd Floor', daily_charge: 250.00, status: 'Available', description: 'Intensive Care Unit with Ventilator' },
    { bed_number: 'ICU-B02', ward_type: 'ICU', floor: '3rd Floor', daily_charge: 250.00, status: 'Occupied', description: 'Intensive Care Unit with Ventilator' },
    { bed_number: 'CCU-B01', ward_type: 'CCU', floor: '3rd Floor', daily_charge: 220.00, status: 'Available', description: 'Coronary Care Unit Cardiac Bed' },
    { bed_number: 'GEN-M01', ward_type: 'General_Male', floor: '2nd Floor', daily_charge: 50.00, status: 'Occupied', description: 'General Male Ward Bed' },
    { bed_number: 'GEN-M02', ward_type: 'General_Male', floor: '2nd Floor', daily_charge: 50.00, status: 'Available', description: 'General Male Ward Bed' },
    { bed_number: 'CAB-101', ward_type: 'Cabin', floor: '4th Floor', daily_charge: 120.00, status: 'Occupied', description: 'Single Deluxe AC Cabin' },
    { bed_number: 'CAB-102', ward_type: 'Cabin', floor: '4th Floor', daily_charge: 120.00, status: 'Available', description: 'Single Deluxe AC Cabin' },
    { bed_number: 'VIP-001', ward_type: 'VIP_Cabin', floor: '5th Floor', daily_charge: 300.00, status: 'Available', description: 'Executive VIP Suite' },
  ];

  for (const b of wardsData) {
    const existing = await prisma.wards_and_beds.findUnique({ where: { bed_number: b.bed_number } });
    if (!existing) {
      await prisma.wards_and_beds.create({ data: b });
      console.log(`  ✅ Created bed: ${b.bed_number} (${b.ward_type})`);
    }
  }

  console.log('🎉 CareSync HMS seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
