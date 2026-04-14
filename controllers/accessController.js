const db = require('../config/db');

// Verify access to a cursus
exports.getCursus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const query = `
      SELECT * FROM purchases
      WHERE user_id = $1 AND cursus_id = $2
    `;

    const result = await db.query(query, [userId, id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ message: "Access granted to cursus" });

  } catch (error) {
    console.error("getCursus error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify access to a lesson
exports.getLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Step 1: Get cursus_id from lesson
    const lessonQuery = `
      SELECT cursus_id FROM lessons WHERE id = $1
    `;

    const lessonResult = await db.query(lessonQuery, [id]);

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const cursusId = lessonResult.rows[0].cursus_id;

    // Step 2: Check if user purchased cursus
    const purchaseQuery = `
      SELECT * FROM purchases
      WHERE user_id = $1 AND cursus_id = $2
    `;

    const purchaseResult = await db.query(purchaseQuery, [userId, cursusId]);

    if (purchaseResult.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ message: "Access granted to lesson" });

  } catch (error) {
    console.error("getLesson error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user certifications
exports.getCertifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT c.*, cu.title AS cursus_title
      FROM certifications c
      JOIN cursus cu ON c.cursus_id = cu.id
      WHERE c.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    return res.json(result.rows);

  } catch (error) {
    console.error("getCertifications error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};