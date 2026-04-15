const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Check if user exists
    const existingUser = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already in use"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Insert user
    await db.query(
      `
      INSERT INTO users 
      (name, email, password, role, is_verified, activation_token, created_at, updated_at)
      VALUES ($1, $2, $3, 'client', false, $4, NOW(), NOW())
      `,
      [name, email, hashedPassword, activationToken]
    );

    // Send email
    try {
      await sendVerificationEmail(email, activationToken);

      return res.status(201).json({
        message: "Account created. Please check your email to activate your account."
      });

    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);

      return res.status(500).json({
        message: "Account created but email could not be sent"
      });
    }

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// ACTIVATE ACCOUNT
exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).send("<h3>Invalid token</h3>");
    }

    const result = await db.query(
      `
      UPDATE users 
      SET is_verified = true, activation_token = NULL
      WHERE activation_token = $1
      RETURNING id
      `,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).send("<h3>Invalid or expired link</h3>");
    }

    return res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Compte activé</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(circle at 30% 30%, #0074c7, #00497c 60%, #002f5a);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }

          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 45px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 
              0 20px 60px rgba(0,0,0,0.25),
              0 0 40px rgba(0,116,199,0.2);
            max-width: 420px;
            transition: transform 0.3s ease;
          }

          .card:hover {
            transform: translateY(-5px);
          }

          h1 {
            color: #82b864;
            font-size: 28px;
            margin bottom: 15px;
          }

          p {
            font-size: 15px;
            color: #384050;
            margin: 8px 0;
          }

          a {
            display: inline-block;
            margin-top: 25px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #0074c7, #00497c);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            transition: all 0.3s ease;
          }

          a:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          }

        </style>
      </head>

      <body>
        <div class="card">
          <h1>Compte activé</h1>
          <p>Votre compte a été activé avec succès.</p>
          <p>Vous pouvez maintenant vous connecter.</p>
          <a href="http://localhost:3001">Retour à l'accueil</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("ACTIVATION ERROR:", error);
    return res.status(500).send("<h3>Server error</h3>");
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const user = result.rows[0];

    // Check verification
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your account before logging in"
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};