const db = require('../config/db');

// Simulate payment (sandbox)
exports.simulatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, item_id } = req.body;

    // Validation
    if (!type || !item_id) {
      return res.status(400).json({
        message: "Donnees requises manquantes"
      });
    }

    if (!["cursus", "lesson"].includes(type)) {
      return res.status(400).json({
        message: "Type d'achat invalide"
      });
    }

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PURCHASE CURSUS
    if (type === "cursus") {

      // Prevent duplicate purchase
      const existing = await db.query(
        `SELECT id FROM purchases WHERE user_id = $1 AND cursus_id = $2`,
        [userId, item_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          message: "Cursus déjà acheté"
        });
      }

      await db.query(
        `
        INSERT INTO purchases (user_id, cursus_id, created_at)
        VALUES ($1, $2, NOW())
        `,
        [userId, item_id]
      );

      return res.json({
        message: "Cursus acheté avec succès✅"
      });
    }

    // PURCHASE LESSON
    if (type === "lesson") {

      // Prevent duplicate purchase
      const existing = await db.query(
        `SELECT id FROM purchases WHERE user_id = $1 AND lesson_id = $2`,
        [userId, item_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          message: "Leçon déjà achetée"
        });
      }

      await db.query(
        `
        INSERT INTO purchases (user_id, lesson_id, created_at)
        VALUES ($1, $2, NOW())
        `,
        [userId, item_id]
      );

      return res.json({
        message: "Leçon achetée avec succès ✅"
      });
    }

  } catch (error) {
    console.error("simulatePayment error:", error);
    return res.status(500).json({
      message: "Erreur du serveur"
    });
  }
};