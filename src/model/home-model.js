const mongoose = require('mongoose');

const postSchema = mongoose.model(
  'posts',
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    description: {
      type: String,
    },
    bgms: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    is_Public: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post-likes',
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post-comments',
      },
    ],
  })
);

const postLikes = mongoose.model(
  'post-likes',
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  })
);
const postComments = mongoose.model(
  'post-comments',
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    content: { type: String },
    created_at: { type: Date, default: Date.now },
  })
);

module.exports = {
    postSchema,
    postLikes,
    postComments,
  };
  