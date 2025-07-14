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

router.post('/login', (req, res, next) => {
  console.log('Login request body:', req.body);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!user) {
      console.log('Authentication failed:', info.message);
      return res.status(401).json({ error: info.message });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      console.log('User logged in:', user.email);
      return res.redirect('/'); // Редирект после успешного входа
    });
  })(req, res, next);
});

// Выход
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/'); // Редирект на главную
  });
});

// Профиль
router.get('/profile', authController.profile);

module.exports = router;
