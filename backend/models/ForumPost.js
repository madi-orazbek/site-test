const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    minlength: 10
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ForumReply' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  tags: [{ 
    type: String 
  }]
});

// Индекс для поиска по заголовку и содержимому
forumPostSchema.index({ title: 'text', content: 'text' });

// Обновление даты изменения при сохранении
forumPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ForumPost', forumPostSchema);