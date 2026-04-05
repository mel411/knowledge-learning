const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email invalide"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    // check existing user
    const checkQuery = `SELECT id FROM users WHERE email = ?`;

    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error("DB CHECK ERROR:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé"
        });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // generate activation token
      const activationToken = crypto.randomBytes(32).toString('hex');

      const insertQuery = `
        INSERT INTO users 
        (name, email, password, role, is_verified, activation_token, created_at, updated_at)
        VALUES (?, ?, ?, 'client', false, ?, NOW(), NOW())
      `;

      db.query(insertQuery, [name, email, hashedPassword, activationToken], async (err) => {
        if (err) {
          console.error("DB INSERT ERROR:", err);
          return res.status(500).json({
            message: "Erreur lors de la création du compte"
          });
        }

        try {
          await sendVerificationEmail(email, activationToken);

          return res.status(201).json({
            message: "Compte créé. Vérifiez votre email pour l’activer."
          });

        } catch (emailError) {
          console.error("EMAIL ERROR:", emailError);

          return res.status(500).json({
            message: "Compte créé mais email non envoyé"
          });
        }
      });
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ACTIVATE ACCOUNT
exports.activateAccount = (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).send("<h3>Token invalide</h3>");
  }

  const query = `
    UPDATE users 
    SET is_verified = true, activation_token = NULL
    WHERE activation_token = ?
  `;

  db.query(query, [token], (err, result) => {
    if (err) {
      console.error("ACTIVATION ERROR:", err);
      return res.status(500).send("<h3>Erreur serveur</h3>");
    }

    if (result.affectedRows === 0) {
      return res.status(400).send("<h3>Lien invalide ou expiré</h3>");
    }

    return res.send(`
      <div style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h2 style="color: green;">Compte activé avec succès</h2>
        <p>Vous pouvez maintenant vous connecter à votre compte.</p>
        <a href="http://localhost:3001" style="color: blue;">
          Retour à l'accueil
        </a>
      </div>
    `);
  });
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email et mot de passe requis"
    });
  }

  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: "Utilisateur introuvable"
      });
    }

    const user = results[0];

    // check verification
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Veuillez activer votre compte avant de vous connecter"
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Mot de passe incorrect"
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token });
  });
};