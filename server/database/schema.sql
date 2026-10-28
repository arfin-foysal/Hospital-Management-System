-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: hms_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admissions`
--

DROP TABLE IF EXISTS `admissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admission_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `bed_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `admission_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `discharge_date` datetime DEFAULT NULL,
  `admission_reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_diagnosis` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Admitted','Discharged') COLLATE utf8mb4_unicode_ci DEFAULT 'Admitted',
  `discharge_summary` text COLLATE utf8mb4_unicode_ci,
  `discharge_condition` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_number` (`admission_number`),
  KEY `patient_id` (`patient_id`),
  KEY `bed_id` (`bed_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `admissions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admissions_ibfk_2` FOREIGN KEY (`bed_id`) REFERENCES `wards_and_beds` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `admissions_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '10:00 AM',
  `token_number` int NOT NULL,
  `type` enum('OPD','Follow-up','Emergency','Routine') COLLATE utf8mb4_unicode_ci DEFAULT 'OPD',
  `status` enum('Scheduled','In-Queue','In-Consultation','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Scheduled',
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_number` (`appointment_number`),
  KEY `idx_date_doctor` (`appointment_date`,`doctor_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualification` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultation_fee` decimal(10,2) NOT NULL DEFAULT '500.00',
  `available_days` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
  `consultation_hours` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '09:00 AM - 05:00 PM',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `admission_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `consultation_fee` decimal(10,2) DEFAULT '0.00',
  `bed_charges` decimal(10,2) DEFAULT '0.00',
  `pharmacy_charges` decimal(10,2) DEFAULT '0.00',
  `lab_charges` decimal(10,2) DEFAULT '0.00',
  `nursing_charges` decimal(10,2) DEFAULT '0.00',
  `other_charges` decimal(10,2) DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT '0.00',
  `due_amount` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('Cash','Credit Card','Debit Card','bKash / Mobile Banking','Insurance','Bank Transfer') COLLATE utf8mb4_unicode_ci DEFAULT 'Cash',
  `payment_status` enum('Paid','Partial','Unpaid') COLLATE utf8mb4_unicode_ci DEFAULT 'Unpaid',
  `billing_date` date NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_requests`
--

DROP TABLE IF EXISTS `lab_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `prescription_id` int DEFAULT NULL,
  `test_id` int NOT NULL,
  `priority` enum('Normal','Urgent','Emergency') COLLATE utf8mb4_unicode_ci DEFAULT 'Normal',
  `status` enum('Pending','Sample Collected','Completed','Delivered') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `result_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `report_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technician_id` int DEFAULT NULL,
  `test_date` date NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_number` (`requisition_number`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `test_id` (`test_id`),
  KEY `technician_id` (`technician_id`),
  CONSTRAINT `lab_requests_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_requests_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_requests_ibfk_3` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lab_requests_ibfk_4` FOREIGN KEY (`test_id`) REFERENCES `lab_tests_catalog` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_requests_ibfk_5` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_tests_catalog`
--

DROP TABLE IF EXISTS `lab_tests_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests_catalog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Hematology','Biochemistry','Microbiology','Radiology','Pathology','Cardiology') COLLATE utf8mb4_unicode_ci NOT NULL,
  `standard_charge` decimal(10,2) NOT NULL,
  `normal_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `turnaround_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '24 Hours',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `test_code` (`test_code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `generic_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Tablet','Capsule','Syrup','Injection','Ointment','IV Fluid','Suspension','Inhaler') COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '20',
  `expiry_date` date NOT NULL,
  `location_rack` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Rack-A1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_medicine_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') COLLATE utf8mb4_unicode_ci DEFAULT 'O+',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `emergency_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `chronic_conditions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_phone` (`phone`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pharmacy_sale_items`
--

DROP TABLE IF EXISTS `pharmacy_sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `pharmacy_sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `pharmacy_sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pharmacy_sale_items_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pharmacy_sales`
--

DROP TABLE IF EXISTS `pharmacy_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int DEFAULT NULL,
  `patient_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescription_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `net_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('Paid','Pending') COLLATE utf8mb4_unicode_ci DEFAULT 'Paid',
  `dispensed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `patient_id` (`patient_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `dispensed_by` (`dispensed_by`),
  CONSTRAINT `pharmacy_sales_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pharmacy_sales_ibfk_2` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pharmacy_sales_ibfk_3` FOREIGN KEY (`dispensed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructions` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `consultation_date` date NOT NULL,
  `symptoms` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnosis` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '120/80 mmHg',
  `pulse` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '75 bpm',
  `temperature` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '98.6 °F',
  `weight` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '68 kg',
  `lifestyle_advice` text COLLATE utf8mb4_unicode_ci,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescription_number` (`prescription_number`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescriptions_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','receptionist','doctor','patient','pharmacist','lab_technician','accountant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wards_and_beds`
--

DROP TABLE IF EXISTS `wards_and_beds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards_and_beds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bed_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_type` enum('General Male','General Female','ICU','CCU','Cabin','VIP Cabin','Pediatric') COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '1st Floor',
  `daily_charge` decimal(10,2) NOT NULL DEFAULT '1000.00',
  `status` enum('Available','Occupied','Maintenance','Cleaning') COLLATE utf8mb4_unicode_ci DEFAULT 'Available',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bed_number` (`bed_number`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-28 15:44:02
