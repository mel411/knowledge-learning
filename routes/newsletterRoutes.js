const express = require("express");
const router = express.Router();

const { sendNewsletterEmail } = require("../services/emailService");

// POST /api/newsletter
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis." });
  }

  try {
    await sendNewsletterEmail(email);

    res.json({ message: "Inscription réussie !" });
  } catch (err) {
    console.error("Erreur newsletter:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;