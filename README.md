# CareSync HMS — Enterprise Hospital Management System

A full-stack, enterprise-grade **Hospital Management System (HMS)** built with a clean layered architecture conforming to standard Healthcare Software Requirements Specifications (SRS).

---

## 🏛️ System Architecture

The backend strictly implements a **4-Layer Decoupled Architecture**:

```
Client (React 18 + Vite + Tailwind CSS)
   │
   ▼ HTTP / REST + Bearer JWT
Routes Layer (`server/routes/`)
   │  - Route definitions & endpoint mappings
   │  - Auth & Role-Based Access Control (RBAC) middleware
   ▼
Controllers Layer (`server/controllers/`)
   │  - HTTP Request extraction & validation
   │  - Uniform API response serialization (`{ success, data, message }`)
   ▼
Services Layer (`server/services/`)
   │  - Business logic, transactions & workflow calculations
   │  - Data aggregations (e.g. unbilled OPD, IPD, Pharmacy & Lab fees)
   ▼
Prisma ORM Layer (`server/prisma/` + `server/config/prisma.js`)
   │  - Type-safe relational database access
   │  - Model relations, nested transactions & joins
   ▼
MySQL Database (`hms_db`)
```

---

## 👥 7 User Roles & 1-Click Demo Accounts

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@hospital.com` | `admin123` | Full access, user management, RBAC, analytics, audit logs |
| **Doctor** | `doctor@hospital.com` | `doctor123` | Consultations, digital Rx, vitals tracking, lab requisitions |
| **Receptionist** | `receptionist@hospital.com` | `reception123` | Patient registrations, OPD queue scheduling, appointments |
| **Pharmacist** | `pharmacist@hospital.com` | `pharma123` | Medicine inventory, stock alerts, POS dispensing counter |
| **Lab Tech** | `labtech@hospital.com` | `lab123` | Test requisitions, specimen findings, diagnostic reports |
| **Accountant** | `accountant@hospital.com` | `account123` | Consolidated patient billing, payment receipts, unbilled aggregations |
| **Patient** | `patient@hospital.com` | `patient123` | Health records portal, view prescriptions, appointments, lab reports |

> ⚡ **Demo Quick Switcher**: The login page includes 1-click buttons for all 7 roles to instantly authenticate and evaluate the system.

---

## 🚀 Key Modules & Features

### 1. Patient Management Module
* Demographic intake (Name, Age, Gender, Phone, Address, Blood Group, Allergies, Medical History).
* Automated unique Patient Code generation (`PAT-YYYY-XXXX`).
* 360° Medical History Timeline (Visits, Diagnoses, Prescriptions, Lab Tests, Inpatient stays).

### 2. Appointment & OPD Queue Management
* Multi-doctor consultation scheduling with day/time slot validation.
* Live OPD Token Queue Manager with status transitions: `Scheduled` ➔ `In Consultation` ➔ `Completed` / `Cancelled`.

### 3. IPD & Bed Management
* Real-time ward & bed occupancy tracking (General Male/Female, ICU, CCU, Deluxe Cabins, VIP Suites).
* Transactional admission & discharge with automated summary notes and clinical condition records.

### 4. EMR & Digital Prescriptions
* Comprehensive clinical notes: Vitals (BP, Pulse, Temp, Weight), Symptoms, and Diagnosis.
* Prescribed medication regimen (Medicine Name, Dosage, Frequency, Duration, Instructions).
* Direct diagnostic laboratory requisition ordering within the consultation flow.
* Printable official prescription format with hospital letterhead and physician signature zone.

### 5. Pharmacy & Inventory Management
* Batch inventory with unit pricing, expiry warnings (60-day threshold), and low-stock indicators.
* Point of Sale (POS) dispensing interface with immediate stock deduction and printed receipt.

### 6. Laboratory & Diagnostics
* Standardized test catalog across Hematology, Biochemistry, Microbiology, Radiology & Pathology.
* Test requisition lifecycle: `Pending` ➔ `In Progress` ➔ `Completed`.
* Record biological findings, normal reference ranges, pathologist notes, and optional report upload.
* Formatted printable diagnostic investigation report.

### 7. Consolidated Billing & Finance
* **Automated Charge Aggregator**: Gathers unbilled doctor consultation fees, IPD bed rent days, pharmacy sales, and lab test orders into a single consolidated invoice.
* Supports Cash, Credit/Debit Card, and Online/Mobile Banking payments with printable receipts.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
* **Backend**: Node.js, Express 5, Prisma ORM 6.4.1, JSON Web Tokens (JWT), Bcrypt.js, Multer
* **Database**: MySQL 8.0+ with relational foreign keys and indices

---

## ⚙️ Setup & Installation

### 1. Database Configuration
Ensure MySQL is running on `localhost:3306`, then set your `.env` in `server/.env`:
```env
PORT=5000
DATABASE_URL="mysql://root:root@localhost:3306/hms_db"
JWT_SECRET="hms_enterprise_super_secret_jwt_key_2026"
```

### 2. Backend Installation & Prisma Generation
```bash
cd server
npm install
npm run prisma:generate
npm run seed              # Seeds default users, test catalog, beds & medicines
npm start                 # Starts the backend on http://localhost:5000
```

### 3. Visual Database Explorer (Prisma Studio)
```bash
cd server
npm run prisma:studio     # Opens Prisma Studio on http://localhost:5555
```

### 4. Frontend Installation & Build
```bash
cd ../client
npm install
npm run build             # Compiles client into server/public or client/dist
npm run dev               # Or run Vite dev server on http://localhost:5173
```

---

## 📡 Key API Routes

| Resource | Method | Path | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | JWT Authentication | Public |
| **Auth** | `POST` | `/api/auth/register` | Patient Self-Registration | Public |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Real-time Hospital KPIs & Metrics | Authenticated |
| **Patients** | `GET, POST` | `/api/patients` | List & Register Patients | Authenticated |
| **Appointments** | `GET, POST` | `/api/appointments` | Book & Track OPD Queue | Authenticated |
| **IPD / Beds** | `GET, POST` | `/api/ipd/beds` & `/admit` | Bed Allocations & Admissions | Admin, Receptionist, Doctor |
| **EMR / Rx** | `GET, POST` | `/api/emr` | Digital Prescriptions | Doctor, Admin |
| **Pharmacy** | `GET, POST` | `/api/pharmacy/medicines` | SKU Stock & Low-Alerts | Pharmacist, Admin |
| **Pharmacy POS** | `POST` | `/api/pharmacy/dispense` | Dispense & Auto-Deduct Stock | Pharmacist, Admin |
| **Laboratory** | `GET, POST` | `/api/lab/requests` | Requisitions & Results | Lab Tech, Doctor, Admin |
| **Billing** | `GET` | `/api/billing/pending/:id` | Unbilled Charges Aggregator | Accountant, Admin |
| **Billing** | `POST` | `/api/billing/invoices` | Create Consolidated Bill | Accountant, Admin |
| **Users / RBAC** | `GET, POST` | `/api/users` | Staff Account Management | Admin Only |
| **Emergency / Triage** | `GET, POST` | `/api/emergency` & `/transfer-ipd` | Trauma Triage & Immediate Admission | Authenticated |
| **Blood Bank** | `GET, POST` | `/api/blood-bank/inventory` & `/requisitions` | Cold Storage Stock & Transfusion Issue | Authenticated |
| **Operation Theatre** | `GET, POST` | `/api/ot/surgeries` & `/theatres` | Surgical Booking & Theatre Lifecycle | Authenticated |
| **Nursing Station** | `GET, POST` | `/api/nursing/vitals` & `/emar` | Bedside Vitals Flowsheet & eMAR Log | Authenticated |
| **Notifications** | `GET, POST` | `/api/notifications/logs` & `/send` | Automated SMS & Carrier Dispatch Logs | Admin Only |

