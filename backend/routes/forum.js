const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { ensureAuthenticated } = require('../middleware/auth');

// Главная страница форума
router.get('/', forumController.getAllPosts);

// Создание поста
router.get('/new', ensureAuthenticated, forumController.newPost);
router.post('/', ensureAuthenticated, forumController.createPost);

// Детали поста
router.get('/:id', ensureAuthenticated, forumController.getPostDetails);

// Добавление ответа
router.post('/:id/reply', ensureAuthenticated, forumController.addReply);

// Отметка как решение
router.post('/:postId/solution/:replyId', 
  ensureAuthenticated, 
  forumController.markAsSolution
);

// Поиск по форуму
router.get('/search', forumController.searchPosts);

module.exports = router;