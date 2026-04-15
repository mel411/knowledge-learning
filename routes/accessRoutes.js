const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const db = require('../config/db');

router.get('/lesson/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const lessonId = req.params.id;

  const query = `
    SELECT * FROM purchases 
    WHERE user_id = $1
    AND (
      lesson_id = $2
      OR cursus_id = (
        SELECT cursus_id FROM lessons WHERE id = $3
      )
    )
    `;

  const result = await db.query(query, [userId, lessonId, lessonId]);

  res.json({ access: result.rows.length > 0 });
  });

module.exports = router;
