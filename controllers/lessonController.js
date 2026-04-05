const db = require('../config/db');

exports.getLessonsByCursus = (req, res) => {
  const { cursusId } = req.params;

  const query = `
    SELECT id, title, content
    FROM lessons
    WHERE cursus_id = ?
  `;

  db.query(query, [cursusId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json(results);
  });
};