const db = require('../config/db');


// Verify access to a cursus
exports.getCursus = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const query = `
    SELECT * FROM purchases
    WHERE user_id = ? AND cursus_id = ?
  `;

  db.query(query, [userId, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.json({ message: "Accès autorisé au cursus" });
  });
};


// Verify access to a lesson
exports.getLesson = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // get cursus from lesson
  const lessonQuery = `
    SELECT cursus_id FROM lessons WHERE id = ?
  `;

  db.query(lessonQuery, [id], (err, lessonResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (lessonResult.length === 0) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }

    const cursusId = lessonResult[0].cursus_id;

    // check if user bought the cursus
    const purchaseQuery = `
      SELECT * FROM purchases
      WHERE user_id = ? AND cursus_id = ?
    `;

    db.query(purchaseQuery, [userId, cursusId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      res.json({ message: "Accès autorisé à la leçon" });
    });
  });
};

exports.getCertifications = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.*, cu.title AS cursus_title
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
};