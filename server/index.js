const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Prisma
const prisma = require('./config/prisma');

// Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const ipdRoutes = require('./routes/ipdRoutes');
const emrRoutes = require('./routes/emrRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const labRoutes = require('./routes/labRoutes');
const billingRoutes = require('./routes/billingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');
const otRoutes = require('./routes/otRoutes');
const nursingRoutes = require('./routes/nursingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads for lab reports
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      service: 'CareSync Hospital Management System API (Prisma ORM)',
      version: '1.0.0',
      database: 'Connected (MySQL + Prisma)',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      service: 'CareSync Hospital Management System API',
      database: 'Disconnected',
      error: err.message
    });
  }
});

// Layered Architecture: API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/ot', otRoutes);
app.use('/api/nursing', nursingRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend build if exists
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, async () => {
  console.log(`================================================================`);
  console.log(`🏥 CareSync HMS Server running with Prisma ORM on port ${PORT}`);
  console.log(`🔗 Web Application: http://localhost:${PORT}`);
  console.log(`🔗 REST API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏗️  Architecture: Route ➔ Controller ➔ Service ➔ Prisma ORM`);
  console.log(`================================================================`);
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to MySQL database (hms_db) successfully.');
  } catch (e) {
    console.error('❌ Prisma failed to connect to database:', e.message);
  }
});

