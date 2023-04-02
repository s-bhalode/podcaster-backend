const mongoose = require("mongoose");

const userSchema = mongoose.model(
  "user",
  new mongoose.Schema({
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
    },
    user_password: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
    },
    registered_date: {
      type: Date,
      default: Date.now,
    },
    is_public: {
      type: Boolean,
      default: true,
    },
    user_gender: {
      type: String
    },
    user_contact_no : {
      type: Number
    },
    user_dob: {
      type: Date
    },
    user_profile_pic: {
      type: String
    },
    user_instagram_url: {
      type: String
    },
    user_facebook_url : {
      type: String
    },
    user_twitter_url: {
      type: String
    }
  })
);

const userActivitySchema = mongoose.model(
  "userActivity",
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: "true",
    },
    activity_type: {
      type: String,
      required: true,
    },
    podcast_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "podcasts",
    },
    posts_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'posts'
    },
    post_comment_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post-comments'
    },
    post_like_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post-likes'
    },
    podcast_comment_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post-comments'
    },
    podcast_like_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post-likes'
    },
    episode_id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'episodes'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    followers: {

    },
    following: {

    },
    saved_history: {
      post: {
        
      },
      podcast: {

      }
    },
    favorites: {

    }
  })
);

module.exports = {
  userSchema,
  userActivitySchema,
};
