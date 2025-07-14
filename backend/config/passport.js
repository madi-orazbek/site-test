const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  // Стратегия аутентификации
  passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      console.log('Попытка аутентификации:', email);
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Пользователь не найден');
        return done(null, false, { message: 'User not found' });
      }
      
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        console.log('Неверный пароль');
        return done(null, false, { message: 'Incorrect password' });
      }
      
      console.log('Успешная аутентификация:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      return done(error);
    }
  }
));
  ));

  // Сериализация пользователя
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Десериализация пользователя
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
