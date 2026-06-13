const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

// POST /api/contact
router.post('/', async (req, res) => {
  const { prenom, nom, email, sujet, message } = req.body;

  // Basic validation
  if (!prenom || !nom || !email || !sujet || !message) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    await sendContactEmail({ prenom, nom, email, sujet, message });
    res.json({ message: 'Message envoyé avec succès.' });
  } catch (err) {
    console.error('Erreur envoi contact:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
  }
});

module.exports = router;
