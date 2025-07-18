const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token verification
const pool = require('../config/db'); // Import database connection for user validation

// Middleware for authentication and role-based access control
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication error: No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded); // Debug: see the payload

    const [users] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [decoded.user.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Authentication error: User not found.' });
    }
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication error: Token has expired.' });
    }
    return res.status(401).json({ message: 'Authentication error: Invalid token.' });
  }
};

// Middleware to check user roles
const roleMiddleware = (roles) => (req, res, next) => {
  // This middleware relies on `authMiddleware` having run first to set `req.user`.
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. You do not have the required permissions.' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };