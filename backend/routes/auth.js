const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Регистрация
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

router.post('/register', authController.register);

// Вход
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

router.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: true 
  }), 
  (req, res) => {
    res.redirect('/');
  }
);

// Выход
router.get('/logout', authController.logout);

// Профиль
router.get('/profile', authController.profile);

module.exports = router;