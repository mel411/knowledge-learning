const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/cursus', verifyToken, purchaseController.buyCursus);

module.exports = router;