const mongoose = require('mongoose');

const podcastSchema = mongoose.model(
  'podcasts',
  new mongoose.Schema({
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    image: {
      type: String,
    },
    size: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    bgms: {
      type: String,
    },
    category: {
      type: String,
    },
    duration: {
      type: String,
      // required: true,
    },
    file: {
      type: String,
      // required: true,
    },
    location: {
      type: String,
    },
    tagged_people: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    episode: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'episodes',
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'podcast-likes',
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'podcast-comments',
      },
    ],
  })
);
// shares: [{
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User',
// }],

const episodeSchema = mongoose.model(
  'episodes',
  new mongoose.Schema({
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    audioFile: {
      type: String,
    },
    duration: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    size: {
      type: String,
      required: true
    }
  })
);

const podcastLikes = mongoose.model(
  'podcast-likes',
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  })
);
const podcastComments = mongoose.model(
  'podcast-comments',
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    content: { type: String },
    created_at: { type: Date, default: Date.now },
  })
);

module.exports = {
  podcastSchema,
  episodeSchema,
  podcastLikes,
  podcastComments,
};
