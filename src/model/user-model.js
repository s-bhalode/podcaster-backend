const mongoose = require('mongoose');

const userSchema = mongoose.model(
  'user',
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

module.exports = userSchema

