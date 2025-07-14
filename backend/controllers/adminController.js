// controllers/adminController.js
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');
// Главная админ-панель
const adminPanel = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const courses = await Course.find();
    
    res.render('admin/panel', { 
      users, 
      courses,
      searchQuery: '', // Добавляем пустую строку по умолчанию
      user: req.user 
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка загрузки админ-панели');
    res.redirect('/');
  }
};

// Управление доступом к курсам
const manageAccess = async (req, res) => {
  try {
    const { userId, courseId, action } = req.body;
    
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      req.flash('error', 'Пользователь или курс не найден');
      return res.redirect('/admin');
    }
    
    if (action === 'grant') {
      if (!user.accessibleCourses.includes(courseId)) {
        user.accessibleCourses.push(courseId);
        await user.save();
        req.flash('success', `Доступ к курсу "${course.title}" предоставлен`);
      }
    } else if (action === 'revoke') {
      user.accessibleCourses = user.accessibleCourses.filter(
        id => id.toString() !== courseId
      );
      await user.save();
      req.flash('success', `Доступ к курсу "${course.title}" отозван`);
    }
    
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка управления доступом');
    res.redirect('/admin');
  }
};

// Поиск пользователей
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    
    const courses = await Course.find();
    
    res.render('admin/panel', { 
      users, 
      courses,
      searchQuery: query || '', // Гарантируем наличие значения
      user: req.user 
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка поиска пользователей');
    res.redirect('/admin');
  }
};

module.exports = {
  adminPanel,
  manageAccess,
  searchUsers
};