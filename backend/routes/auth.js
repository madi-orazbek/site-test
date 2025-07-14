const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Регистрация
router.get('/register', (req, res) => {
  res.render('auth/register', { error: req.flash('error') });
});

router.post('/register', authController.register);

// Вход
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/login', (req, res, next) => {
  console.log('Login request body:', req.body);

  if (!req.body.email || !req.body.password) {
    req.flash('error', 'Email и пароль обязательны');
    return res.redirect('/login');
  }
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      req.flash('error', 'Ошибка сервера при аутентификации');
      return res.redirect('/login');
    }
    
    if (!user) {
      console.log('Authentication failed:', info.message);
      req.flash('error', info.message || 'Неверные учетные данные');
      return res.redirect('/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        req.flash('error', 'Ошибка при входе в систему');
        return res.redirect('/login');
      }
      
      // Сохраняем сессию перед редиректом
      req.session.save(() => {
        console.log('Session saved after login');
        req.flash('success', `Добро пожаловать, ${user.username}!`);
        return res.redirect('/');
      });
    });
  })(req, res, next);
});

// Выход
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success', 'Вы успешно вышли из системы');
    res.redirect('/');
  });
});

// Профиль
router.get('/profile', authController.profile);

module.exports = router;
