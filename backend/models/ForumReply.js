const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    minlength: 3,
    maxlength: 1000
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ForumPost', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isSolution: { 
    type: Boolean, 
    default: false 
  }
});

// Индекс для быстрого поиска ответов по посту
forumReplySchema.index({ post: 1 });

module.exports = mongoose.model('ForumReply', forumReplySchema);