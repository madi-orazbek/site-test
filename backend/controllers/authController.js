const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Course = require('../models/Course');
// Регистрация пользователя
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Проверка существующего пользователя
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('auth/register', { 
                error: 'Пользователь с таким именем или email уже существует' 
            });
        }

        // Создание нового пользователя
        const newUser = new User({ username, email, password, role });
        await newUser.save();
        
        // Автоматический вход после регистрации
        req.login(newUser, (err) => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.render('auth/register', { error: 'Ошибка регистрации' });
    }
};

// Вход пользователя
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.render('auth/login', { error: info.message });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
};

// Выход пользователя
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect('/');
    });
};

// Страница профиля
exports.profile = async (req, res) => {
  try {
    // Простая версия для теста
    const courses = await Course.find({
      _id: { $in: req.user.accessibleCourses || [] }
    }).limit(3);
    
    res.render('profile', { 
      user: req.user, 
      courses 
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};