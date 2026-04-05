const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/cursus', verifyToken, purchaseController.buyCursus);

if (purchaseController.buyLesson) {
  router.post('/lesson', verifyToken, purchaseController.buyLesson);
}

module.exports = router;