const jwt = require('jsonwebtoken');

// Verify JWT Token
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      return res.status(403).json({
        message: "Token manquant"
      });
    }

    // Expected format: Bearer TOKEN
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(403).json({
        message: "Format du token invalide"
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT ERROR:", error);

    return res.status(401).json({
      message: "Token invalide ou expiré"
    });
  }
};

// Check admin role
exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Accès refusé : administrateur uniquement"
      });
    }

    next();

  } catch (error) {
    console.error("isAdmin error:", error);

    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};