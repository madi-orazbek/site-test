module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Пожалуйста войдите для доступа');
    res.redirect('/login');
  },

  ensureStudent: (req, res, next) => {
    if (req.user.role === 'student') return next();
    req.flash('error', 'Доступно только студентам');
    res.redirect('back');
  },

  ensureTeacher: (req, res, next) => {
    if (req.user.role === 'teacher' || req.user.role === 'admin') return next();
    req.flash('error', 'Доступно только преподавателям');
    res.redirect('back');
  },

  ensureAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    req.flash('error', 'Доступно только администраторам');
    res.redirect('/');
  }
};
exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  req.flash('error', 'Доступно только администраторам');
  res.redirect('/');
};
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Пожалуйста войдите для доступа');
  res.redirect('/login');
};