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
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

console.log('===== Конфигурация =====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? '***' : 'not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '***' : 'not set');
console.log('PORT:', process.env.PORT);
console.log('========================');

// Подключение к БД
require('./config/db')();

// Конфигурация приложения
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
const corsOptions = {
  credentials: true,
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000'
};
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
app.use(cors(corsOptions));

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
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Критически важно!
  }
}));

// Проверка сессии
app.get('/session', (req, res) => {
  res.json({
    session: req.session,
    user: req.user,
    authenticated: req.isAuthenticated()
  });
});

// Flash сообщения
app.use(flash());

app.use(csrfProtection);

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
  res.locals.csrfToken = req.csrfToken();
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
