const db = require('../config/db');

// simulate payment (sandbox)
exports.simulatePayment = (req, res) => {
  const userId = req.user.id;
  const { type, item_id } = req.body;

  if (!type || !item_id) {
    return res.status(400).json({ message: "Missing data" });
  }

  // fake payment success
  setTimeout(() => {

    if (type === "cursus") {

      const query = `
        INSERT INTO purchases (user_id, cursus_id)
        VALUES (?, ?)
      `;

      db.query(query, [userId, item_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        return res.json({ message: "Achat du cursus réussi ✅" });
      });

    } else if (type === "lesson") {

      const query = `
        INSERT INTO purchases (user_id, lesson_id)
        VALUES (?, ?)
      `;

      db.query(query, [userId, item_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        return res.json({ message: "Achat de la leçon réussi ✅" });
      });

    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

  }, 1000);

};