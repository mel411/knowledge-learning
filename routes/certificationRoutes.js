const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const certificationController = require('../controllers/certificationController');

router.get('/', verifyToken, certificationController.getUserCertifications);

module.exports = router;