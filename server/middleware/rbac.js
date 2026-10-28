// Role-Based Access Control (RBAC) middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Role missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted for role '${req.user.role}'. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};

