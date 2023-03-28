const userSchema = require('../model/user-model');
const Podcast = require('../model/podcast-model');

const createPodcast = async (req, res) => {
  const { userId } = req.params;
  const user_id = userId;
  const {
    title,
    description,
    duration,
    image,
    bgms,
    file,
    category,
    created_at,
} = req.body;
  try {
    //creating a podcast (this function is same for all the user)
    const newPodcast = await Podcast.podcastSchema.create({
      title,
      description,
      duration,
      user_id,
      image,
      bgms,
      file,
      category,
      created_at,
    });
    const podcast_id = newPodcast._id;
    const activity_type = 'my-podcasts';

    return res.status(200).json(newPodcast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPodcastById = async (req, res) => {
  const { podcastId } = req.params;
  try {
    // Find the podcast by ID
    const podcast = await Podcast.podcastSchema
      .findById(podcastId)
      .populate('user_id')
      .populate('episode')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
        },
      });
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    } else {
      return res.status(200).json({ podcast });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPodcast = async (req, res) => {
  try {
    // Find all the podcast ( get API for taking all podcast)
    const podcast = await Podcast.podcastSchema
      .find()
      .populate('user_id')
      .populate('episode')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
        },
      });
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    } else {
      return res.status(200).json({ podcast });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPodcastbyCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const podcastCategories = await Podcast.podcastSchema.findOne({
      category: category,
    });
    if (!podcastCategories) {
      return res
        .status(404)
        .json({ error: 'Podcast not found with its Category' });
    } else {
      return res.status(200).json(podcastCategories);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePodcastById = async (req, res) => {
  const { title, description, duration, image, bgms, file, category } =
    req.body;
  const { userId, podcastId } = req.params;

  const podcast = await Podcast.podcastSchema
    .findById(podcastId)
    .populate('user_id');
  if (!podcast) {
    return res.status(404).json({ message: 'Podcast not found' });
  } else if (podcast.user._id.toString() !== userId) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to update this podcast' });
  } else {
    try {
      const updatedPodcast = await Podcast.podcastSchema.findByIdAndUpdate(
        podcastId,
        {
          title,
          description,
          duration,
          image,
          bgms,
          file,
          category,
        },
        { new: true }
      );
      return res.status(200).json(updatedPodcast);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const pushCommentsIntoPodcastbyId = async (req, res) => {
  const { userId, podcastId } = req.params;
  const user_id = userId;
  const { content } = req.body;

  try {
    const newComment = new Podcast.podcastComments({
      user_id,
      content,
    });

    const savedComment = await newComment.save();
    const podcast = await Podcast.podcastSchema.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    } else {
      podcast.comments.push(savedComment._id);
      const updatedPodcast = await podcast.save();
      return res.status(200).json(updatedPodcast);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const pushLikesIntoPodcastbyId = async (req, res) => {
  console.log(req.body);
  const { userId, podcastId } = req.params;
  const user_id = userId;

  try {
    const newLikes = new Podcast.podcastLikes({
      user_id,
    });

    const savedLikes = await newLikes.save();
    const podcast = await Podcast.podcastSchema.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    } else {
      podcast.likes.push(savedLikes._id);
      const pushedLikes = await podcast.save();
      return res.status(200).json(pushedLikes);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createEpisodes = async (req, res) => {
  const { title, description, audioFile, duration } = req.body;
  console.log(req.params);
  const { podcastId, userId } = req.params;
  try {
    const newEpisode = new Podcast.episodeSchema({
      title,
      description,
      audioFile,
      duration,
    });
    const savedEpisode = await newEpisode.save();

    const podcast = await Podcast.podcastSchema.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    } else {
      podcast.episode.push(savedEpisode);
      const updatedPodcast = await podcast.save();
      return res.status(200).json(updatedPodcast);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserPodcastData = async (req, res) => {
  const { userId } = req.params;
  try {
    const podcasts = await Podcast.podcastSchema.findOne({ user: userId });
    if (!podcasts) {
      res.status(404).json({ message: 'Podcast not find' });
    } else {
      return res.status(200).json(podcasts);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPodcastById,
  createPodcast,
  getAllPodcast,
  updatePodcastById,
  pushCommentsIntoPodcastbyId,
  createEpisodes,
  pushLikesIntoPodcastbyId,
  getPodcastbyCategory,
  getUserPodcastData,
};
