const db = require('../config/db');

// VALIDATE LESSON
exports.validateLesson = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.body || !req.body.lesson_id) {
      return res.status(400).json({ message: "lesson_id requis" });
    }

    const { lesson_id } = req.body;

    // 1. Check if user has access (lesson or cursus)
    const accessQuery =
      "SELECT id FROM purchases WHERE user_id = $1 AND (lesson_id = $2 OR cursus_id = (SELECT cursus_id FROM lessons WHERE id = $2))";

    const accessResult = await db.query(accessQuery, [userId, lesson_id]);

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        message: "Vous devez acheter cette leçon avant de la valider"
      });
    }

    // 2. Check if already validated
    const existingValidationQuery =
      "SELECT id FROM validations WHERE user_id = $1 AND lesson_id = $2";

    const existingValidation = await db.query(existingValidationQuery, [userId, lesson_id]);

    if (existingValidation.rows.length > 0) {
      return res.status(400).json({
        message: "Leçon déjà validée"
      });
    }

    // 3. Insert validation
    const insertValidationQuery =
      "INSERT INTO validations (user_id, lesson_id, validated_at) VALUES ($1, $2, NOW())";

    await db.query(insertValidationQuery, [userId, lesson_id]);

    // 4. Get all lessons from same cursus
    const lessonsQuery =
      "SELECT id, cursus_id FROM lessons WHERE cursus_id = (SELECT cursus_id FROM lessons WHERE id = $1)";

    const lessonsResult = await db.query(lessonsQuery, [lesson_id]);

    if (lessonsResult.rows.length === 0) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const lessonIds = lessonsResult.rows.map(l => l.id);
    const cursusId = lessonsResult.rows[0].cursus_id;

    // 5. Count validated lessons (SAFE VERSION using IN)
    let validatedCount = 0;

    if (lessonIds.length > 0) {
      const placeholders = lessonIds.map((_, i) => `$${i + 2}`).join(",");

      const countQuery = `
        SELECT COUNT(DISTINCT lesson_id) AS total
        FROM validations
        WHERE user_id = $1
        AND lesson_id IN (${placeholders})
      `;

      const countResult = await db.query(countQuery, [userId, ...lessonIds]);
      validatedCount = parseInt(countResult.rows[0].total, 10);
    }

    console.log("validatedCount:", validatedCount);
    console.log("lessonIds.length:", lessonIds.length);

    // 6. If all lessons validated → certification
    if (validatedCount === lessonIds.length) {

      const existingCertQuery =
        "SELECT id FROM certifications WHERE user_id = $1 AND cursus_id = $2";

      const existingCert = await db.query(existingCertQuery, [userId, cursusId]);

      if (existingCert.rows.length > 0) {
        return res.json({
          message: "Leçon validée + cursus déjà complété"
        });
      }

      const insertCertQuery =
        "INSERT INTO certifications (user_id, cursus_id, obtained_at) VALUES ($1, $2, NOW())";

      await db.query(insertCertQuery, [userId, cursusId]);

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

    const query =
      "SELECT id FROM validations WHERE user_id = $1 AND lesson_id = $2";

    const result = await db.query(query, [userId, lessonId]);

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