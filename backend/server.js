require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// Подключение к БД
require('./config/db')();

// Конфигурация приложения
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// Сессии
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));
// Flash сообщения
app.use(flash());

// Инициализация Passport
const initializePassport = require('./config/passport');
initializePassport(passport);

// Passport middleware (ВАЖНО: после сессии!)
app.use(passport.initialize());
app.use(passport.session());

// Переменные для шаблонов (после Passport)
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Главная страница (перед маршрутами)
app.get('/', (req, res) => {
  res.render('index', { user: req.user || null });
});

// Маршруты (после Passport)
app.use('/', require('./routes/auth'));
app.use('/courses', require('./routes/courses'));
app.use('/assignments', require('./routes/assignments'));
app.use('/forum', require('./routes/forum'));
app.use('/admin', require('./routes/admin'));

// Обработка 404
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Страница не найдена',
    user: req.user || null
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Внутренняя ошибка сервера',
    user: req.user || null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту http://localhost:${PORT}`));
