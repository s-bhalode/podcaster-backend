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
  const { id } = req.params;
  try {
    const user = await userSchema.userSchema
      .findById(id)
      .populate({
        path: 'following',
        select: 'user_name user_email user_role user_profile_pic',
      })
      .populate({
        path: 'followers',
        select: 'user_name user_email user_role user_profile_pic',
      })
      .populate({
        path: 'saved_history',
        populate: {
          path: 'episode podcasts posts',
        },
      })
      .populate({
        path: 'favorites',
        populate: {
          path: 'episode podcasts posts',
        },
      });

    const podcasts = await Podcast.podcastSchema.find({ user_id: id });
    const post = await home.postSchema.find({ user_id: id });
    console.log(post);
    return res.status(200).json({ user, post, podcasts });
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
const saveToCollections = async (req, res) => {
  try{
    const {userId} = req.params;
    const {itemType, itemId, collection_name} = req.body;
    const user_id = userId;
    if(itemType === 'post'){
      const post_id = itemId;
      const newCollection = await userSchema.userCollectionSchema({
        user_id,
        collection_name,
        post_id
      }).save();
      if(newCollection){
        return res.status(200).json({message: "Added to collection successfully!"})
      }  
    }else if(itemType === 'podcast'){
      const podcast_id = itemId;
      const newCollection = await userSchema.userCollectionSchema({
        user_id,
        collection_name,
        podcast_id,
      }).save();
      if(newCollection){
        return res.status(200).json({message: "Added to collection successfully!"})
      } 
    }else if(itemType === 'episode'){
      const episode_id = itemId;
      const newCollection = await userSchema.userCollectionSchema({
        user_id,
        collection_name,
        episode_id,
      }).save();
      if(newCollection){
        return res.status(200).json({message: "Added to collection successfully!"})
      } 
    }
  }catch(err){
    console.log(err);
    return res.status(500).json({message: 'Error occurred while saving to collections!'});
  }
}
const removeFromCollections = async (req, res) => {
  try{
    const {id} = req.params;
    userSchema.userCollectionSchema.findByIdAndDelete({_id: id}).then((result) => {
      if(!result){
        return res.status(404).json({message: 'Item not found'});
      }
    }).catch((err) => {
      console.error(err);
      return res
        .status(500)
        .json({ message: 'Error occurred while removing data from collections' });
    })

  }catch(err){
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while removing data from collections' });
  }
}
const getAllCollectionName = async (req, res) => {
  try{
    const {userId} = req.params;
    const collections = await userSchema.userCollectionSchema.find({user_id: userId}).distinct('collection_name');

    return res.status(200).json(collections);
  }catch(err){
    console.log(err);
    return res.status(422).json({message: 'Something went wrong!'});
  }
}
const getCollectionData = async (req, res) => {
  try{
    const {collection_name, userId} = req.params;
    // const collections = await userSchema.userCollectionSchema.find({user_id: userId});
    const collections = (await userSchema.userCollectionSchema.find({user_id: userId, collection_name: collection_name}));

    return res.status(200).json(collections);
  }catch(err){
    console.log(err);
    return res.status(422).json({message: 'Something went wrong!'});
  }
}
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
const getAllPlayedHistory = async (req, res) => {
  try{
    const {userId} = req.params;
    const user = await userSchema.userSchema
      .findById(userId)
      .populate({
        path: 'user_played_history'
      });

    if(!user){
      return res.status(404).json({message: 'user not found'})
    }
    
    return res.status(200).json(user.user_played_history);
  }catch(err){
    console.log(err);
    return res.status(500).json({message: 'Error while retrieving history'});
  }
}
const addToPlayedHistory = async (req, res) => {
  try{
    const {userId} = req.params;
    const {episodeId} = req.body;
    const user = await userSchema.userSchema.findById(userId);

    user.user_played_history.push(episodeId);
    await user.save();
    return res.status(200).json('Successfully played');
  }catch(err){
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while playing' });
  }
}
const removeFromPlayedHistory = async (req, res) => {
  try{
    const {userId} =  req.params;
    const {episodeId} =  req.body;
    const removed = await userSchema.userSchema.updateOne({'_id': userId}, {$pull: {'user_played_history' : episodeId}});
    if(!removed){
      return res
      .status(422)
      .json({ message: 'Error occurred while removing' });
    }
    return res.status(200).json('Removed successfully!');
  }catch(err){
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while removing' });
  }
}
const getAllDownloads = async (req, res) => {
  try{
    const {userId} = req.params;
    const user = await userSchema.userSchema.findById(userId);

    if(!user){
      return res.status(404).json({message: 'user not found'})
    }
    return res.status(200).json(user.user_downloads);
  }catch(err){
    console.log(err);
    return res.status(500).json({message: 'Error while retrieving downloads'});
  }
}
const addToDownloads = async (req, res) => {
  try{
    const {userId} = req.params;
    const {episodeId} = req.body;
    const user = await userSchema.userSchema.findById(userId);

    user.user_downloads.push(episodeId);
    await user.save();
    return res.status(200).json('Successfully added downloads');
  }catch(err){
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while playing' });
  }
}
const removeFromDownloads = async (req, res) => {
  try{
    const {userId} =  req.params;
    const {episodeId} =  req.body;
    const removed = await userSchema.userSchema.updateOne({'_id': userId}, {$pull: {'user_downloads' : episodeId}});
    if(!removed){
      return res
      .status(422)
      .json({ message: 'Error occurred while removing' });
    }
    return res.status(200).json('Removed successfully!');
  }catch(err){
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while removing' });
  }
}
const podcastRecommendation = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userSchema.userSchema.findById(userId);
    const userInterests = user.interests;

    const recommPodcasts = await Podcast.podcastSchema
      .find({ category: { $in: userInterests } })
      .populate({
        path: 'episode',
        populate: {
          path: 'comments',
          populate: {
            path: 'user_id',
            select: 'user_name user_email user_role user_profile_pic',
          },
          options: { sort: { created_at: 'desc' } },
        },
      })
      .populate({
        path: 'user_id',
        select: 'user_name user_email user_role user_profile_pic',
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
          select: 'user_name user_email user_role user_profile_pic',
        },
        options: { sort: { created_at: 'desc' } },
      });
    const sortedRecommPodcasts = recommPodcasts.sort(
      (a, b) => b.likes.length - a.likes.length
    );

    // return res.status(200).json(sortedRecommPodcasts.slice(0, 10));
    return res.status(200).json(sortedRecommPodcasts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while recommending podcasts' });
  }
};
const postRecommendation = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userSchema.userSchema.findById(userId);
    const userInterests = user.interests;

    const recommPosts = await home.postSchema
      .find({ category: { $in: userInterests } })
      .populate({
        path: 'user_id',
        select: 'user_name user_email user_role user_profile_pic',
      })
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
        },
        options: { sort: { created_at: 'desc' } },
      });
    console.log(recommPosts);

    const sortedRecommPosts = recommPosts.sort(
      (a, b) => b.likes.length - a.likes.length
    );

    return res.status(200).json(sortedRecommPosts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while recommending posts' });
  }
};
const addUserInterest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { interest } = req.body;

    const user = await userSchema.userSchema.findById(userId);
    if (!user) {
      return res
        .status(500)
        .json({ message: 'Error occurred while adding user interests' });
    }
    interest.map((inter) => {
      user.interests.push(inter);
    });

    await user.save();
    return res.status(200).json('Interests added successfully!');
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'Error occurred while adding user interests' });
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
  addUserInterest,
  podcastRecommendation,
  postRecommendation,
  getAllCollectionName,
  getCollectionData,
  saveToCollections,
  removeFromCollections,
  getAllPlayedHistory,
  addToPlayedHistory,
  removeFromPlayedHistory,
  getAllDownloads,
  addToDownloads,
  removeFromDownloads
};
