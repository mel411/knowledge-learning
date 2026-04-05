const db = require('../config/db');

// get user certifications
exports.getUserCertifications = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.id, c.cursus_id, cu.title
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