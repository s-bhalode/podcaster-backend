const mongoose = require('mongoose');

const postSchema = mongoose.model(
  'posts',
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    description: {
      type: String,
    },
    bgms: {
      type: String,
    },
    text_style: {
      type: Object,
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
    tagged_people: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    is_Public: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now, 
    },
    category: [{
      type: String,
    }],
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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  })
);
const postComments = mongoose.model(
  'post-comments',
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    content: { type: String },
    created_at: { type: Date, default: Date.now },
  })
);

const schedulePostSchema = mongoose.model(
  'scheduleposts',
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    description: {
      type: String,
    },
    bgms: {
      type: String,
    },
    text_style: {
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
    schedule_time: {
      type: Date,
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

module.exports = {
  postSchema,
  postLikes,
  postComments,
  schedulePostSchema,
};
