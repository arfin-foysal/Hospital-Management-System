const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hospital_jwt_key_2026_xyz!@#';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
    req.user = decodedUser;
    next();
  });
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};

