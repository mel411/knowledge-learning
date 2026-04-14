const db = require('../config/db');

// Get lessons by cursus
exports.getLessonsByCursus = async (req, res) => {
  try {
    const { cursusId } = req.params;

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

    const result = await db.query(query, [cursusId]);

    return res.json(result.rows);

  } catch (error) {
    console.error("getLessonsByCursus error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};