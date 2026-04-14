const db = require('../config/db');

// ==============================
// VALIDATE LESSON
// ==============================
exports.validateLesson = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.body || !req.body.lesson_id) {
      return res.status(400).json({ message: "lesson_id requis" });
    }

    const { lesson_id } = req.body;

    // Check if user has access (lesson or cursus)
    const accessQuery = `
      SELECT id FROM purchases
      WHERE user_id = $1
      AND (
        lesson_id = $2
        OR cursus_id = (
          SELECT cursus_id FROM lessons WHERE id = $2
        )
      )
    `;

    const accessResult = await db.query(accessQuery, [userId, lesson_id]);

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        message: "Vous devez acheter cette leçon avant de la valider"
      });
    }

    // Check if already validated
    const existingValidation = await db.query(
      `
      SELECT id FROM validations 
      WHERE user_id = $1 AND lesson_id = $2
      `,
      [userId, lesson_id]
    );

    if (existingValidation.rows.length > 0) {
      return res.status(400).json({
        message: "Leçon déjà validée"
      });
    }

    // Insert validation
    await db.query(
      `
      INSERT INTO validations (user_id, lesson_id, validated_at)
      VALUES ($1, $2, NOW())
      `,
      [userId, lesson_id]
    );

    // Get all lessons from same cursus
    const lessonsResult = await db.query(
      `
      SELECT id, cursus_id FROM lessons
      WHERE cursus_id = (
        SELECT cursus_id FROM lessons WHERE id = $1
      )
      `,
      [lesson_id]
    );

    if (lessonsResult.rows.length === 0) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const lessonIds = lessonsResult.rows.map(l => l.id);
    const cursusId = lessonsResult.rows[0].cursus_id;

    // Count validated lessons
    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM validations
      WHERE user_id = $1
      AND lesson_id = ANY($2)
      `,
      [userId, lessonIds]
    );

    const validatedCount = parseInt(countResult.rows[0].total, 10);

    // If all lessons validated → certification
    if (validatedCount === lessonIds.length) {

      const existingCert = await db.query(
        `
        SELECT id FROM certifications
        WHERE user_id = $1 AND cursus_id = $2
        `,
        [userId, cursusId]
      );

      if (existingCert.rows.length > 0) {
        return res.json({
          message: "Leçon validée + cursus déjà complété"
        });
      }

      await db.query(
        `
        INSERT INTO certifications (user_id, cursus_id, obtained_at)
        VALUES ($1, $2, NOW())
        `,
        [userId, cursusId]
      );

      return res.json({
        message: "Leçon validée + cursus complété !"
      });
    }

    // Default response
    return res.json({
      message: "Leçon validée"
    });

  } catch (error) {
    console.error("validateLesson error:", error);
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

// CHECK VALIDATION
exports.checkValidation = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;

    const result = await db.query(
      `
      SELECT id FROM validations
      WHERE user_id = $1 AND lesson_id = $2
      `,
      [userId, lessonId]
    );

    return res.json({
      validated: result.rows.length > 0
    });

  } catch (error) {
    console.error("checkValidation error:", error);
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};