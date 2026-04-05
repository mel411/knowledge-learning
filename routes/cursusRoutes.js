const express = require('express');
const router = express.Router();
const cursusController = require('../controllers/cursusController');

router.get('/', cursusController.getAllCursus);
router.get('/:id/lessons', cursusController.getLessonsByCursus);

router.get('/', (req, res) => {
  db.query("SELECT * FROM cursus", (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
});

module.exports = router;