const db = require('../config/db');

// Simulate payment (sandbox)
exports.simulatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, lesson_id, cursus_id } = req.body;

    console.log("BODY:", req.body);
    console.log("TYPE:", type);
    console.log("lesson_id:", lesson_id);
    console.log("cursus_id:", cursus_id);

    // Validation
    if (!type || (!lesson_id && !cursus_id)) {
      return res.status(400).json({
        message: "Donnees requises manquantes"
      });
    }

    if (!["cursus", "lesson"].includes(type)) {
      return res.status(400).json({
        message: "Type d'achat invalide"
      });
    }

    if (type === "cursus" && !cursus_id) {
      return res.status(400).json({ message: "cursus_id requis" });
    }

    if (type === "lesson" && !lesson_id) {
      return res.status(400).json({ message: "lesson_id requis" });
    }

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PURCHASE CURSUS
    if (type === "cursus") {

      // Prevent duplicate purchase
      const existing = await db.query(
        `SELECT id FROM purchases WHERE user_id = $1 AND cursus_id = $2`,
        [userId, cursus_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          message: "Cursus déjà acheté"
        });
      }

      await db.query(
        `INSERT INTO purchases (user_id, cursus_id, created_at)
        VALUES ($1, $2, NOW())`,
        [userId, cursus_id]
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
        [userId, lesson_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          message: "Leçon déjà achetée"
        });
      }

      await db.query(
        `INSERT INTO purchases (user_id, lesson_id, created_at)
        VALUES ($1, $2, NOW())`,
        [userId, lesson_id]
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