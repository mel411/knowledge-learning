const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const authController = require('../controllers/authController');

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// REGISTER
router.post('/register', csrfProtection, authController.register);

// LOGIN
router.post('/login', csrfProtection, authController.login);

// ACTIVATE ACCOUNT
router.get('/activate/:token', authController.activateAccount);

module.exports = router;