const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { ensureAuthenticated, ensureStudent } = require('../middleware/auth');

// Детали задания
router.get('/:id', ensureAuthenticated, assignmentController.getAssignmentDetails);

// Сдача решения
router.post('/:id/submit', 
  ensureAuthenticated, 
  ensureStudent, 
  assignmentController.submitSolution
);

// Покупка задания (эмуляция)
router.post('/:id/buy', 
  ensureAuthenticated, 
  ensureStudent, 
  assignmentController.buyAssignment
);

module.exports = router;