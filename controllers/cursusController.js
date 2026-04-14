const db = require('../config/db');

// Get all cursus
exports.getAllCursus = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.title,
        c.price,
        t.name AS theme
      FROM cursus c
      JOIN themes t ON c.theme_id = t.id
      ORDER BY c.id ASC
    `;

    const result = await db.query(query);

    return res.json(result.rows);

  } catch (error) {
    console.error("getAllCursus error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// Get lessons by cursus
exports.getLessonsByCursus = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        title,
        content,
        video_url,
        price
      FROM lessons
      WHERE cursus_id = $1
      ORDER BY id ASC
    `;

    const result = await db.query(query, [id]);

    return res.json(result.rows);

  } catch (error) {
    console.error("getLessonsByCursus error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};