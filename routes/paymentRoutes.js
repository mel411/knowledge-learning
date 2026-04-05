const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/', verifyToken, paymentController.simulatePayment);

module.exports = router;