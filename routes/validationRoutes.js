const express = require('express');
const router = express.Router();

const validationController = require('../controllers/validationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Validate a lesson
router.post('/lesson', verifyToken, validationController.validateLesson);

// Check if a lesson is already validated 
router.get('/check/:id', verifyToken, validationController.checkValidation);

module.exports = router;