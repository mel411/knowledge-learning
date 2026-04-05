const db = require('../config/db');

exports.buyCursus = (req, res) => {
  const userId = req.user.id;
  const { cursus_id } = req.body;

  if (!cursus_id) {
    return res.status(400).json({ message: "cursus_id is required" });
  }

  // Verify if user is verified
  const checkUserQuery = 'SELECT is_verified FROM users WHERE id = ?';

  db.query(checkUserQuery, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur du serveur" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isVerified = userResult[0].is_verified;

    if (!isVerified) {
      return res.status(403).json({
        message: "Compte non activé. Veuillez vérifier votre email avant d’acheter."
      });
    }

    const checkPurchaseQuery = `
      SELECT * FROM purchases 
      WHERE user_id = ? AND cursus_id = ?
    `;

    db.query(checkPurchaseQuery, [userId, cursus_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur du serveur" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Cursus déjà acheté" });
      }

      const insertQuery = `
        INSERT INTO purchases (user_id, cursus_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `;

      db.query(insertQuery, [userId, cursus_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur du serveur" });
        }

        res.json({ message: "Cursus acheté avec succès" });
      });
    });
  });
};

// Lesson purchase
exports.buyLesson = (req, res) => {
  const userId = req.user.id;
  const { lesson_id } = req.body;

  if (!lesson_id) {
    return res.status(400).json({ message: "lesson_id is required" });
  }

  const checkUserQuery = 'SELECT is_verified FROM users WHERE id = ?';

  db.query(checkUserQuery, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur du serveur" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isVerified = userResult[0].is_verified;

    if (!isVerified) {
      return res.status(403).json({
        message: "Compte non activé. Veuillez vérifier votre email avant d’acheter."
      });
    }

    const checkPurchaseQuery = `
      SELECT * FROM purchases 
      WHERE user_id = ? AND lesson_id = ?
    `;

    db.query(checkPurchaseQuery, [userId, lesson_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur du serveur" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Leçon déjà achetée" });
      }

      const insertQuery = `
        INSERT INTO purchases (user_id, lesson_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `;

      db.query(insertQuery, [userId, lesson_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur du serveur" });
        }

        res.json({ message: "Leçon achetée avec succès" });
      });
    });
  });
};