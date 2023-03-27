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
    isPublic: {
      type: Boolean,
      default: true,
    },
  })
);

const userActivitySchema = mongoose.model(
  "userActivity",
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: "true",
    },
    activityType: {
      type: String,
      required: true,
    },
    podcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "podcasts",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  })
);

module.exports = {
  userSchema,
  userActivitySchema,
};
