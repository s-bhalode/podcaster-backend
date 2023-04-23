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
    location,
    tagged_people,
    size,
    schedule_time,
  } = req.body;
  try {
    const newPodcast = await Podcast.schedulePodcastSchema.create({
      title,
      description,
      duration,
      user_id,
      image,
      bgms,
      file,
      category,
      created_at,
      location,
      tagged_people,
      size,
      schedule_time,
    });
    const podcast_id = newPodcast._id;
    return res.status(200).json(newPodcast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadPodcast = async (podcast) => {
  console.log('Podcast is scheduled for id', podcast.id);
  const {
    user_id,
    title,
    description,
    duration,
    image,
    bgms,
    file,
    category,
    created_at,
    location,
    tagged_people,
    size,
  } = podcast;
  // console.log('Persons userID is :-', user_id);
  const audioFile = file;
  try {
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
      location,
      tagged_people,
      size,
    });
    const podcast_id = newPodcast._id;
    const activity_type = 'my-podcasts';

    const savedPodcast = await Podcast.podcastSchema.findById(podcast_id);
    if (savedPodcast.episode.length === 0) {
      const firstEpisode = new Podcast.episodeSchema({
        title,
        description,
        audioFile,
        duration,
        size,
      });
      const firstEpisodeId = firstEpisode.id;
      await firstEpisode.save();

      savedPodcast.episode.push(firstEpisodeId);
      const save = await savedPodcast.save();
      if (save) {
        console.log('New Podcasts First Episode saved');
      }
    }
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      podcast_id,
    });

    return podcast.id;
  } catch (err) {
    console.error(err);
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
        options: { sort: { created_at: 'desc' } }
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
        options: { sort: { created_at: 'desc' } }
      });
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    } else {
      return res.status(200).json(podcast);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPodcastbyCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const podcastCategories = await Podcast.podcastSchema
      .find({
        category: category,
      })
      .populate('user_id');
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
  const podcast_id = podcastId;
  const { content } = req.body;
  const activity_type = 'podcast-comment';

  try {
    const newComment = new Podcast.podcastComments({
      user_id,
      content,
    });
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      podcast_id,
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
  // console.log(req.body);
  const { userId, podcastId } = req.params;
  const podcast_id = podcastId;
  const user_id = userId;
  const activity_type = 'liked-podcast';

  try {
    const newLikes = new Podcast.podcastLikes({
      user_id,
    });
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      podcast_id,
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
  const { title, description, audioFile, duration, size } = req.body;
  console.log(req.params);
  const { podcastId, userId } = req.params;
  const user_id = userId;
  const podcast_id = podcastId;
  const activity_type = 'episode';
  try {
    const newEpisode = new Podcast.episodeSchema({
      title,
      description,
      audioFile,
      duration,
      size,
    });
    const episode_id = newEpisode._id;
    const savedEpisode = await newEpisode.save();

    const podcast = await Podcast.podcastSchema.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    } else {
      podcast.episode.push(episode_id);
      await userSchema.userActivitySchema.create({
        user_id,
        activity_type,
        podcast_id,
        episode_id,
      });

      const updatedPodcast = await podcast.save();
      return res.status(200).json(updatedPodcast);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getEpisodeById = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const episode = await Podcast.episodeSchema.findOne({ _id: episodeId });
    if (!episode) {
      return res.status(404).json('Episode not found');
    }
    return res.status(200).json(episode);
  } catch (err) {
    console.log(err);
    return res.status(400).json('Error while getting episode data');
  }
};
const getRecentEpisodes = async (req, res) => {
  try {
    const episode = await Podcast.episodeSchema
      .find()
      .limit(20)
      .sort({ created_at: 'desc' })
      .exec();
    if (!episode) {
      return res.status(404).json('Episodes not found');
    }
    return res.status(200).json(episode);
  } catch (err) {
    console.log(err);
    return res.status(400).json('Error while getting episode data');
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

const getAllPodcastAuthors = async (req, res) => {
  try {
    const authors = await Podcast.podcastSchema
      .find({}, 'user_id')
      .populate('user_id');

    if (!authors) {
      return res.status(500).json('Internal server error');
    }
    return res.status(202).json(authors);
  } catch (err) {
    console.log(err);
    return res.status(400).json('Error while retrieving authors!');
  }
};
const unlikePodcastById = async (req, res) => {
  const { userId, podcastId } = req.params;

  try {
    const podcast = await Podcast.podcastSchema
      .findById(podcastId)
      .populate({
        path: 'likes',
        match: { user_id: userId },
      })
      .exec();
    // console.log(podcast.likes[0]._id);
    if (podcast.likes.length !== 0) {
      const likeId = podcast.likes[0]._id;
      // console.log('like Id =', likeId);
      const index = podcast.likes.findIndex((like) => like._id === likeId);
      // console.log('index :-', index);
      if (index !== -1) {
        await Podcast.podcastSchema.findByIdAndUpdate(
          podcastId,
          { $pull: { likes: likeId } },
          { new: true }
        );
        const unlike = await Podcast.podcastLikes.findByIdAndDelete(likeId);
        return res.status(200).json({message : "Podcast unliked succesfully"});
      } else {
        return res
          .status(404)
          .json({ message: 'User has not liked that podcast' });
      }
    } else {
      return res
        .status(404)
        .json({ message: 'User has not liked that podcast' });
    }
  } catch (err) {
    console.error(err);
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
  getAllPodcastAuthors,
  getEpisodeById,
  getRecentEpisodes,
  uploadPodcast,
  unlikePodcastById,
};
