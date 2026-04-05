const db = require('../config/db');

// get all cursus
exports.getAllCursus = (req, res) => {
  const query = `SELECT * FROM cursus`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json(results);
  });
};

// get lessons by cursus
exports.getLessonsByCursus = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM lessons WHERE cursus_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    res.json(results);
  });
};