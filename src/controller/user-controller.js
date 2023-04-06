const userSchema = require('../model/user-model');
const bcrypt = require('bcrypt');
const Podcast = require('../model/podcast-model');
const home = require('../model/home-model');

const getallUsers = async (req, res) => {
  try {
    const users = await userSchema.userSchema.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getUserbyId = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userSchema.userSchema
      .findById(req.params.id)
      .populate({ path: 'following', select: 'user_name user_email user_role' })
      .populate({ path: 'followers', select: 'user_name user_email user_role' })
      .exec();
      const podcasts = await Podcast.podcastSchema.find({ user: userId });
      const post = await home.postSchema.find({ user: userId });
      
      return res.status(200).json({user,post,podcasts});
      
  } catch (err) {
    return res.status(404).json({ message: 'User not found' });
  }
};

const updateUserbyId = async (req, res) => {
  const {
    user_name,
    user_email,
    user_password,
    user_gender,
    user_contact_no,
    user_dob,
    user_profile_pic,
    user_instagram_url,
    user_facebook_url,
    user_twitter_url,
  } = req.body;
  try {
    const user = await userSchema.userSchema.findById(req.params.id);
    if (user_name) user.user_name = user_name;
    if (user_email) user.user_email = user_email;
    if (user_password) user.user_password = user_password;
    if (user_gender) user.user_gender = user_gender;
    if (user_contact_no) user.user_contact_no = user_contact_no;
    if (user_dob) user.user_dob = user_dob;
    if (user_profile_pic) user.user_profile_pic = user_profile_pic;
    if (user_instagram_url) user.user_instagram_url = user_instagram_url;
    if (user_facebook_url) user.user_facebook_url = user_facebook_url;
    if (user_twitter_url) user.user_twitter_url = user_twitter_url;

    const updatedUser = await user.save();
    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const { userId, activityType } = req.params;

    if (activityType === 'my-podcasts') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('podcast_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'liked-podcast') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('podcast_like_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'podcast-comment') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('podcast_comment_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'my-post') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('posts_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'liked-post') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('post_like_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'post-comment') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('post_comment_id')
        .sort({ timestamp: 'desc' })
        .exec();
      return res.status(200).json(userActivity);
    }
    if (activityType === 'episode') {
      const userActivity = await userSchema.userActivitySchema
        .find({ activity_type: { $in: [activityType, userId] } })
        .populate('podcast_id')
        .populate('episode_id')
        .sort({ timestamp: 'desc' })
        .exec();

      return res.status(200).json(userActivity);
    }

    return res.status(400).json('Invalid activity type');
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: 'Error while retrieving user activity' });
  }
};

const pushFollowerCount = async (req, res) => {
  try {
    const { userId, followerId } = req.params;
    const user = await userSchema.userSchema.findById(userId);
    const currentUser = await userSchema.userSchema.findById(followerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentUser) {
      return res.status(404).json({ message: 'Unauthorized followerId' });
    }
    if (user.followers.includes(followerId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    user.followers.push(followerId);
    await user.save();

    currentUser.following.push(userId);
    await currentUser.save();

    return res.status(200).json({ user, currentUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId, unfollowerId } = req.params;
    const user = await userSchema.userSchema.findById(userId);
    const currentUser = await userSchema.userSchema.findById(unfollowerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentUser) {
      return res.status(404).json({ message: 'Unauthorized unfollowerId' });
    }
    if (!user.followers.includes(unfollowerId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    user.followers = user.followers.filter((id) => id != unfollowerId);
    await user.save();

    currentUser.following = currentUser.following.filter((id) => id != userId);
    await currentUser.save();

    return res.status(200).json({ user, currentUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const saveContent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentType, contentId } = req.body;
    const user = await userSchema.userSchema.findById(userId);

    if (contentType === 'post') {
      user.saved_history.posts.push(contentId);
      await user.save();
      return res.status(200).json('Post added successfully');
    } else if (contentType === 'podcast') {
      user.saved_history.podcasts.push(contentId);
      await user.save();
      return res.status(200).json('Podcast added successfully');
    } else if (contentType === 'episode') {
      user.saved_history.episode.push(contentId);
      await user.save();
      return res.status(200).json('Episode added successfully');
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while saving data' });
  }
};
const removeFromSaved = async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentType, contentId } = req.body;

    if (contentType === 'post') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'saved_history.posts': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing post' });
      }
      return res.status(200).json('Post removed successfully');
    } else if (contentType === 'podcast') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'saved_history.podcasts': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing podcast' });
      }
      return res.status(200).json('Podcast removed successfully');
    } else if (contentType === 'episode') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'saved_history.episode': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing episode' });
      }
      return res.status(200).json('Episode removed successfully');
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while removing data from saved' });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentType, contentId } = req.body;

    if (contentType === 'post') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'favorites.posts': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing post' });
      }
      return res.status(200).json('Post removed successfully');
    } else if (contentType === 'podcast') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'favorites.podcasts': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing podcast' });
      }
      return res.status(200).json('Podcast removed successfully');
    } else if (contentType === 'episode') {
      const success = await userSchema.userSchema.updateOne(
        { _id: userId },
        { $pull: { 'favorites.episode': contentId } }
      );
      if (!success) {
        return res
          .status(400)
          .json({ message: 'Error occurred while removing episode' });
      }
      return res.status(200).json('Episode removed successfully');
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while removing data from favorites' });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentId, contentType } = req.body;
    const user = await userSchema.userSchema.findById(userId);

    if (contentType === 'post') {
      user.favorites.posts.push(contentId);
      await user.save();
      return res.status(200).json('Added to favorites successfully');
    } else if (contentType === 'podcast') {
      user.favorites.podcasts.push(contentId);
      await user.save();
      return res.status(200).json('Added to favorites successfully');
    } else if (contentType === 'episode') {
      user.favorites.episode.push(contentId);
      await user.save();
      return res.status(200).json('Added to favorites successfully');
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while saving data to favorites' });
  }
};

module.exports = {
  getallUsers,
  getUserbyId,
  updateUserbyId,
  getUserActivity,
  pushFollowerCount,
  unfollowUser,
  saveContent,
  addToFavorites,
  removeFromSaved,
  removeFromFavorites,
};
