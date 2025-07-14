const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Изменено здесь
const adminController = require('../controllers/adminController');

router.get('/', 
  authMiddleware.ensureAuthenticated, // Исправлено
  authMiddleware.ensureAdmin, // Исправлено
  adminController.adminPanel
);

router.post('/access', 
  authMiddleware.ensureAuthenticated, // Исправлено
  authMiddleware.ensureAdmin, // Исправлено
  adminController.manageAccess
);

router.get('/search', 
  authMiddleware.ensureAuthenticated, // Исправлено
  authMiddleware.ensureAdmin, // Исправлено
  adminController.searchUsers
);

module.exports = router;