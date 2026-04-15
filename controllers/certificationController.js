const db = require('../config/db');

// Get user certifications
exports.getUserCertifications = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("=== CERTIFICATIONS DEBUG ===");
    console.log("Request userId:", userId);

    // First: check ALL certifications in DB
    const allCerts = await db.query(`SELECT * FROM certifications`);
    console.log("All certifications in DB:", allCerts.rows);

    // Then: check filtered certifications
    const query = `
      SELECT 
        c.id, 
        c.user_id,
        c.cursus_id, 
        c.obtained_at,
        cu.title AS title
      FROM certifications c
      LEFT JOIN cursus cu ON c.cursus_id = cu.id
      WHERE c.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    console.log("Filtered certifications:", result.rows);

    return res.json(result.rows);

  } catch (error) {
    console.error("getUserCertifications error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};