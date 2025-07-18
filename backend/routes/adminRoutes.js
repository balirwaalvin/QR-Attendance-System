const express = require('express');
const router = express.Router();

// Import authentication middleware
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Import controller functions
const {
  registerAdmin,
  loginAdmin,
  getAdmins,
  getAdminProfile,
  updateAdminProfile,
} = require('../controllers/adminController');

// Public routes for registration and login
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes below this point
// Get all admins (Super Admin only) - requires auth and role check
router.get('/', authMiddleware, roleMiddleware(['super_admin']), getAdmins);

// Admin profile routes (protected for any logged-in admin)
router.route('/profile')
  .get(authMiddleware, getAdminProfile)
  .put(authMiddleware, updateAdminProfile);

module.exports = router;