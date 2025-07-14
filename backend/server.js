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
const path = require('path');

console.log('===== Конфигурация =====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? '***' : 'not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '***' : 'not set');
console.log('PORT:', process.env.PORT);
console.log('========================');

// Подключение к БД
require('./config/db')();

// Настройка доверия к прокси
app.set('trust proxy', 1);

// Настройка CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://site-test-y16r.onrender.com']
  : ['http://localhost:3000'];

app.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Конфигурация приложения
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Явно указываем путь к шаблонам
app.use(express.static(path.join(__dirname, 'public'))); // Используем абсолютный путь
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Сессии
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true, // Изменено на true для решения проблем с сессией
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true для HTTPS в продакшене
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Flash сообщения
app.use(flash());

// Инициализация Passport
const initializePassport = require('./config/passport');
initializePassport(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log('--- NEW REQUEST ---');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Session ID:', req.sessionID);
  console.log('Authenticated:', req.isAuthenticated() ? 'Yes' : 'No');
  console.log('User:', req.user ? req.user.email : 'none');
  next();
});

// Переменные для шаблонов
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Главная страница
app.get('/', (req, res) => {
  res.render('index', { user: req.user || null });
});

// Маршруты
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
  console.error('Global error handler:', err.stack);
  
  res.status(500).render('error', { 
    message: 'Внутренняя ошибка сервера',
    user: req.user || null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту http://localhost:${PORT}`));
