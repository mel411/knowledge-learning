const db = require('../config/db');

// Get user certifications
exports.getUserCertifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        c.id, 
        c.cursus_id, 
        cu.title AS cursus_title
      FROM certifications c
      JOIN cursus cu ON c.cursus_id = cu.id
      WHERE c.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    return res.json(result.rows);

  } catch (error) {
    console.error("getUserCertifications error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};