const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const db = require('../config/db');

router.get('/lesson/:id', verifyToken, (req, res) => {
  const userId = req.user.id;
  const lessonId = req.params.id;

  const query = `
    SELECT * FROM purchases 
    WHERE user_id = ? 
    AND (
      lesson_id = ? 
      OR cursus_id = (
        SELECT cursus_id FROM lessons WHERE id = ?
      )
    )
  `;

  db.query(query, [userId, lessonId, lessonId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json({ access: results.length > 0 });
  });
});

module.exports = router;
