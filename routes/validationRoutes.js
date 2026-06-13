const express = require('express');
const router = express.Router();

const validationController = require('../controllers/validationController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/lesson', verifyToken, validationController.validateLesson);
router.get('/check/:id', verifyToken, validationController.checkValidation);
router.get('/user', verifyToken, validationController.getUserValidations);

module.exports = router;