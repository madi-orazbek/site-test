const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');

// Создание нового поста
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const newPost = new ForumPost({
            title,
            content,
            author: req.user._id
        });
        
        await newPost.save();
        res.redirect('/forum');
    } catch (error) {
        console.error(error);
        res.redirect('/forum/new');
    }
};

// Страница создания поста
exports.newPost = (req, res) => {
    res.render('forum/create', { user: req.user });
};

// Детали поста
exports.getPostDetails = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('author')
            .populate({
                path: 'replies',
                populate: { path: 'author' }
            });
        
        if (!post) {
            return res.status(404).render('error', { message: 'Пост не найден' });
        }
        
        res.render('forum/post', { 
            post,
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/forum');
    }
};

// Список всех постов
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate('author')
            .sort({ createdAt: -1 });
        
        res.render('forum/index', { 
            posts,
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Ошибка загрузки форума' });
    }
};

// Добавление ответа
exports.addReply = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) {
            return res.status(404).render('error', { message: 'Пост не найден' });
        }
        
        const { content } = req.body;
        
        const newReply = new ForumReply({
            content,
            author: req.user._id,
            post: post._id
        });
        
        await newReply.save();
        
        post.replies.push(newReply._id);
        await post.save();
        
        res.redirect(`/forum/${post._id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/forum/${req.params.id}`);
    }
};
// Отметка ответа как решение
exports.markAsSolution = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      req.flash('error', 'Пост не найден');
      return res.redirect('/forum');
    }
    
    // Проверка, что пользователь - автор поста
    if (post.author.toString() !== req.user._id.toString()) {
      req.flash('error', 'Вы не автор этого поста');
      return res.redirect(`/forum/${postId}`);
    }
    
    // Сброс предыдущих решений
    await ForumReply.updateMany(
      { post: postId },
      { $set: { isSolution: false } }
    );
    
    // Установка нового решения
    const solution = await ForumReply.findByIdAndUpdate(
      replyId,
      { $set: { isSolution: true } },
      { new: true }
    );
    
    if (!solution) {
      req.flash('error', 'Ответ не найден');
      return res.redirect(`/forum/${postId}`);
    }
    
    req.flash('success', 'Ответ отмечен как решение!');
    res.redirect(`/forum/${postId}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка при отметке решения');
    res.redirect('back');
  }
};

// Поиск по форуму
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.redirect('/forum');
    }
    
    const posts = await ForumPost.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author')
    .limit(20);
    
    res.render('forum/index', { 
      posts,
      searchQuery: q,
      user: req.user 
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка поиска');
    res.redirect('/forum');
  }
};