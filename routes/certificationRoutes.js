const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const certificationController = require('../controllers/certificationController');
const db = require('../config/db');

router.get('/', verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.id, cu.title
    FROM certifications c
    JOIN cursus cu ON c.cursus_id = cu.id
    WHERE c.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
});

module.exports = router;