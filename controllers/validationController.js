const db = require('../config/db');

// VALIDATE LESSON
exports.validateLesson = (req, res) => {
  const userId = req.user.id;

  if (!req.body || !req.body.lesson_id) {
    return res.status(400).json({ message: "lesson_id requis" });
  }

  const { lesson_id } = req.body;

  // CHECK IF USER HAS ACCESS (BOUGHT LESSON OR CURSUS)
  const accessQuery = `
    SELECT * FROM purchases
    WHERE user_id = ?
    AND (
      lesson_id = ?
      OR cursus_id = (
        SELECT cursus_id FROM lessons WHERE id = ?
      )
    )
  `;

  db.query(accessQuery, [userId, lesson_id, lesson_id], (err, accessResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (accessResult.length === 0) {
      return res.status(403).json({
        message: "Vous devez acheter cette leçon avant de la valider"
      });
    }

    // CHECK IF ALREADY VALIDATED
    const checkQuery = `
      SELECT id FROM validations 
      WHERE user_id = ? AND lesson_id = ?
    `;

    db.query(checkQuery, [userId, lesson_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Leçon déjà validée" });
      }

      // INSERT VALIDATION
      const insertQuery = `
        INSERT INTO validations (user_id, lesson_id)
        VALUES (?, ?)
      `;

      db.query(insertQuery, [userId, lesson_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }

        // GET ALL LESSONS FROM SAME CURSUS
        const getLessonsQuery = `
          SELECT id, cursus_id FROM lessons
          WHERE cursus_id = (
            SELECT cursus_id FROM lessons WHERE id = ?
          )
        `;

        db.query(getLessonsQuery, [lesson_id], (err, lessons) => {
          if (err || lessons.length === 0) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur" });
          }

          const lessonIds = lessons.map(l => l.id);
          const cursusId = lessons[0].cursus_id;

          // COUNT VALIDATED LESSONS
          const countValidatedQuery = `
            SELECT COUNT(*) as total 
            FROM validations
            WHERE user_id = ? AND lesson_id IN (?)
          `;

          db.query(countValidatedQuery, [userId, lessonIds], (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Erreur serveur" });
            }

            const validatedCount = result[0].total;

            // IF ALL LESSONS VALIDATED → CERTIFICATION
            if (validatedCount === lessonIds.length) {

              const checkCertQuery = `
                SELECT id FROM certifications
                WHERE user_id = ? AND cursus_id = ?
              `;

              db.query(checkCertQuery, [userId, cursusId], (err, certResult) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: "Erreur serveur" });
                }

                if (certResult.length > 0) {
                  return res.json({
                    message: "Leçon validée + cursus déjà complété "
                  });
                }

                const insertCertQuery = `
                  INSERT INTO certifications (user_id, cursus_id)
                  VALUES (?, ?)
                `;

                db.query(insertCertQuery, [userId, cursusId], (err) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Erreur serveur" });
                  }

                  return res.json({
                    message: "Leçon validée + cursus complété !"
                  });
                });
              });

            } else {
              return res.json({ message: "Leçon validée" });
            }
          });
        });
      });
    });
  });
};

// CHECK VALIDATION
exports.checkValidation = (req, res) => {
  const userId = req.user.id;
  const lessonId = req.params.id;

  const query = `
    SELECT * FROM validations
    WHERE user_id = ? AND lesson_id = ?
  `;

  db.query(query, [userId, lessonId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json({ validated: results.length > 0 });
  });
};