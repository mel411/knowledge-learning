require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const db = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const accessRoutes = require('./routes/accessRoutes');
const validationRoutes = require('./routes/validationRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const cursusRoutes = require('./routes/cursusRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const lessonRoutes = require('./routes/lessonRoutes');

const { verifyToken, isAdmin } = require('./middlewares/authMiddleware');

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });

// serve frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/cursus', cursusRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/lessons', lessonRoutes);

// test protected route
app.get('/api/test', verifyToken, (req, res) => {
  res.json({
    message: "Route protégée fonctionnelle",
    user: req.user
  });
});

// admin access check
app.get('/api/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Accès admin autorisé" });
});


// ADMIN BACKOFFICE

app.get('/api/admin/users', verifyToken, isAdmin, (req, res) => {
  db.query("SELECT id, email, role FROM users", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    console.log("Users data:", results.rows); // DEBUG
    res.json(results.rows);
  });
});

// get all purchases
app.get('/api/admin/purchases', verifyToken, isAdmin, (req, res) => {
  db.query(`
    SELECT 
      p.id,
      u.email,
      c.title AS cursus_title,
      l.title AS lesson_title
    FROM purchases p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN cursus c ON p.cursus_id = c.id
    LEFT JOIN lessons l ON p.lesson_id = l.id
  `, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    console.log("Purchases data:", results.rows); // DEBUG
    res.json(results.rows);
  });
});

app.get('/api/me', verifyToken, async(req, res) => {
  const userId = req.user.id;

  try {
  const result = await db.query(
    "SELECT email, role FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  res.json(result.rows[0]);

} catch (err) {
  console.error(err);
  return res.status(500).json({ message: "Erreur serveur" });
}
});

// start server
const PORT = 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;