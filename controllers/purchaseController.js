const db = require('../config/db');

// Achat d'un cursus
exports.buyCursus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursus_id } = req.body;

    if (!cursus_id) {
      return res.status(400).json({ message: "cursus_id is required" });
    }

    // Vérifier si l'utilisateur est vérifié
    const userResult = await db.query(
      `SELECT is_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isVerified = userResult.rows[0].is_verified;

    if (!isVerified) {
      return res.status(403).json({
        message: "Compte non activé. Veuillez vérifier votre email avant d’acheter."
      });
    }

    // Vérifier achat existant
    const existingPurchase = await db.query(
      `
      SELECT id FROM purchases 
      WHERE user_id = $1 AND cursus_id = $2
      `,
      [userId, cursus_id]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({
        message: "Cursus déjà acheté"
      });
    }

    // Insérer achat
    await db.query(
      `
      INSERT INTO purchases (user_id, cursus_id, created_at)
      VALUES ($1, $2, NOW())
      `,
      [userId, cursus_id]
    );

    return res.json({
      message: "Cursus acheté avec succès"
    });

  } catch (error) {
    console.error("buyCursus error:", error);
    return res.status(500).json({
      message: "Erreur du serveur"
    });
  }
};

// Achat d'une leçon
exports.buyLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id } = req.body;

    if (!lesson_id) {
      return res.status(400).json({ message: "lesson_id is required" });
    }

    // Vérifier si l'utilisateur est vérifié
    const userResult = await db.query(
      `SELECT is_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isVerified = userResult.rows[0].is_verified;

    if (!isVerified) {
      return res.status(403).json({
        message: "Compte non activé. Veuillez vérifier votre email avant d’acheter."
      });
    }

    // Vérifier achat existant
    const existingPurchase = await db.query(
      `
      SELECT id FROM purchases 
      WHERE user_id = $1 AND lesson_id = $2
      `,
      [userId, lesson_id]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({
        message: "Leçon déjà achetée"
      });
    }

    // Insérer achat
    await db.query(
      `
      INSERT INTO purchases (user_id, lesson_id, created_at)
      VALUES ($1, $2, NOW())
      `,
      [userId, lesson_id]
    );

    return res.json({
      message: "Leçon achetée avec succès"
    });

  } catch (error) {
    console.error("buyLesson error:", error);
    return res.status(500).json({
      message: "Erreur du serveur"
    });
  }
};