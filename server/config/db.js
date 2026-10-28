const mysql = require('mysql2/promise');
const prisma = require('./prisma');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'hms_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = {
  pool,
  prisma,
  query: (text, params) => pool.query(text, params),
  execute: (text, params) => pool.execute(text, params)
};

