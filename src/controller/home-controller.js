const userSchema = require('../model/user-model');
const home = require('../model/home-model');
const Podcast = require('../model/podcast-model');
const Chatroom = require('../model/chat-room-model');
const FCM = require('fcm-node');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

const createPost = async (req, res) => {
  const { description, images, is_Public, bgms, created_at, text_style, schedule_time } = req.body;
  const { userId } = req.params;
  const user_id = userId;
  try {
    const newPost = await home.schedulePostSchema.create({
      description,
      user_id,
      images,
      is_Public,
      bgms,
      created_at,
      text_style,
      schedule_time,
    });
    const post_id = newPost._id;
    if (!newPost) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const uploadPost = async (post) => {
  const { description, images, is_Public, bgms, created_at, text_style, schedule_time, user_id } = post;
  try {
    const newPost = await home.postSchema.create({
      description,
      user_id,
      images,
      is_Public,
      bgms,
      created_at,
      text_style,
    });
    if (!newPost) {
      return;
    }
    return post.id;
  } catch (err) {
    console.error(err);
  }
};

// const createPost = async (req, res) => {
//   const { description, images, is_Public, bgms, created_at, text_style } = req.body;
//   const {userId} = req.params;
//   const user_id = userId;
//   const activity_type = 'my-posts';
//   try {
//     const newPost = await home.postSchema.create({
//       description,
//       user_id,
//       images,
//       is_Public,
//       bgms,
//       created_at,
//       text_style
//     });
//     const post_id = newPost._id;
//     await userSchema.userActivitySchema.create({
//       user_id,
//       activity_type,
//       post_id
//     })
//     return res.status(200).json(newPost);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

const getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await home.postSchema
      .findById(postId)
      .populate('user_id')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
        },

        options: { sort: { created_at: 'desc' } },
      });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    } else {
      return res.status(200).json(post);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllPost = async (req, res) => {
  try {
    const post = await home.postSchema
      .find({ is_Public: true })
      .populate('user_id')
      .populate('likes')
      .populate({
        path: "comments",
        populate: {
          path: "user_id",
        },
        options: { sort: { created_at: 'desc' } },
      })
      .sort({ created_at: -1 });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    } else {
      return res.status(200).json(post);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const pushCommentsIntoPostById = async (req, res) => {
  console.log(req.body);
  const { userId, postId } = req.params;
  const user_id = userId;
  const post_id = postId;
  const { content } = req.body;

  const activity_type = 'post-comment';

  try {
    const post = await home.postSchema.findById(postId);

    const device_id = await userSchema.userSchema.findById(post.user_id).then((owner) => {
      if(owner){
        return owner.device_token;
      }
    })
    
    const newComment = new home.postComments({
      user_id,
      content,
    });
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      post_id,
    });
    const savedComment = await newComment.save();
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    } else {
      post.comments.push(savedComment._id);
      const updatedpost = await post.save();
      await userSchema.userSchema.findById(userId).then((user) => {
        if(user){
          const userName = user.user_name;
          const message = `${userName} commented on your post`;
          sendNotification(device_id, message);
        }
      })
      return res.status(200).json(updatedpost);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const pushLikesIntoPostById = async (req, res) => {
  console.log(req.body);
  const { userId, postId } = req.params;
  const user_id = userId;
  const post_id = postId;
  const activity_type = 'liked-post';
  try {
    const newLikes = new home.postLikes({
      user_id,
    });

    const savedLikes = await newLikes.save();
    const post = await home.postSchema.findById(postId);

    const device_id = await userSchema.userSchema.findById(post.user_id).then((owner) => {
      if(owner){
        return owner.device_token;
      }
    })
    
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    } else {
      post.likes.push(savedLikes._id);
      const pushedLikes = await post.save();
      await userSchema.userActivitySchema.create({
        user_id,
        activity_type,
        post_id,
      });
      await userSchema.userSchema.findById(userId).then((user) => {
        if(user){
          const userName = user.user_name;
          const message = `${userName} liked your post`;
          sendNotification(device_id, message);
        }
      })
      return res.status(200).json(pushedLikes);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getUserPostData = async (req, res) => {
  const { userId } = req.params;
  try {
    const post = await home.postSchema.findOne({ user: userId });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
    } else {
      return res.status(200).json(post);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updatePostById = async (req, res) => {
  const { description, images, is_Public, bgms, text_style } = req.body;
  const { userId, postId } = req.params;
  const user_id = userId;

  const post = await home.postSchema.findById(postId).populate('user_id');
  if (!post) {
    return res.status(404).json({ message: 'post not found' });
  } else if (post.user._id.toString() !== userId) {
    return res.status(403).json({ message: 'You are not authorized to update this post' });
  } else {
    try {
      const updatedpost = await post.postSchema.findByIdAndUpdate(
        postId,
        {
          description,
          user_id,
          images,
          is_Public,
          bgms,
          text_style,
        },
        { new: true }
      );
      return res.status(200).json(updatedpost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
const searchPodcasts = async (req, res) => {
  const { term } = req.params;
  const query = new RegExp(term, 'i');
  try {
    const podcast = await Podcast.podcastSchema
      .find({ $or: [{ title: query }, { description: query }] })
      .populate('user_id')
      .populate('episode')
      .exec();
    if (!podcast) {
      return res.status(404).json({ message: 'No search result found!!' });
    }
    return res.status(200).json(podcast);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: 'Internal server error' });
  }
};
const searchPost = async (req, res) => {
  const { term } = req.params;
  const query = new RegExp(term, 'i');
  try {
    const podcast = await home.postSchema
      .find({ $or: [{ description: query }] })
      .populate('user_id')
      .populate('likes')
      .populate({
        path: "comments",
        populate: {
          path: "user_id",
        },
        options: { sort: { created_at: 'desc' } },
      }).sort({ created_at: -1 })
      .exec();
    if (!podcast) {
      return res.status(404).json({ message: 'No search result found!!' });
    }
    return res.status(200).json(podcast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const searchChatrooms = async (req, res) => {
  const { term } = req.params;
  console.log(term);
  const query = new RegExp(term, 'i');
  try {
    const podcast = await Chatroom.find({ $or: [{ chatTopic: query }] })
      .populate('ownerId')
      .exec();
    if (!podcast) {
      return res.status(404).json({ message: 'No search result found!!' });
    }
    return res.status(200).json(podcast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// const searchAuthors = async (req, res) => {
//   const {term} = req.params;
//   console.log(term)
//   const query = new RegExp(term, 'i');
//   try{
//     const authors = await Podcast.podcastSchema.find({
//     }).populate({
//       path: 'user_id',
//       select: 'user_name user_email following followers',
//       match: { user_name: { $regex: query } }
//     }).exec();
//     if(!authors){
//       return res.status(500).json("No search result found!!");
//     }
//     return res.status(202).json(authors);
//   }catch(err){
//     console.log(err);
//     return res.status(400).json("Internal server error");
//   }
// }

const searchAuthors = async (req, res) => {
  const { term } = req.params;
  console.log(term);
  // const query = new RegExp(term, 'i');
  try {
    const authors = await Podcast.podcastSchema.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                user_name: 1,
                user_email: 1,
                user_profile_pic: 1,
              },
            },
          ],
          as: 'author',
        },
      },
      {
        $unwind: '$author',
      },
      {
        $match: {
          $or: [{ 'author.user_name': { $regex: term, $options: 'i' } }],
        },
      },
      {
        $group: {
          _id: '$user_id',
          author: { $addToSet: '$author' },
          podcast_count: { $sum: 1 },
        },
      },
    ]);
    if (!authors) {
      return res.status(500).json('No search result found!!');
    }
    return res.status(202).json(authors);
  } catch (err) {
    console.log(err);
    return res.status(400).json('Internal server error');
  }
};
const getTrendingPosts = async (req, res) => {
  try {
    let posts = await home.postSchema.aggregate([
      {
        $match: {
          is_Public: true,
          $expr: { $gte: [{ $size: '$likes' }, 2] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          likesCount: { $size: '$likes' },
          _id: 1,
          description: 1,
          images: 1,
          text_style: 1,
          username: { $arrayElemAt: ['$user.user_name', 0] },
        },
      },
    ]);
    if (!posts) {
      return res.status(422).json('Something went wrong!');
    }
    posts.sort((a, b) => b.likesCount - a.likesCount);
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};
const podcastsOfTheDay = async (req, res) => {
  try {
    const podcasts = await Podcast.podcastSchema
      .find()
      .sort({ 'likes.length': -1 })
      .limit(1)
      .populate('user_id')
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
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
          select: 'user_name user_email user_role user_profile_pic',
        },
        options: { sort: { created_at: 'desc' } },
      });

    if (!podcasts) {
      return res.status(500).json({ message: 'OOPs! something went wrong' });
    }

    return res.status(200).json(podcasts);
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

const unlikePostById = async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const post = await home.postSchema
      .findById(postId)
      .populate({
        path: 'likes',
        match: { user_id: userId },
      })
      .exec();
    // console.log(podcast.likes[0]._id);
    if (post.likes.length !== 0) {
      const likeId = post.likes[0]._id;
      // console.log('like Id =', likeId);
      const index = post.likes.findIndex((like) => like._id === likeId);
      // console.log('index :-', index);
      if (index !== -1) {
        await home.postSchema.findByIdAndUpdate(postId, { $pull: { likes: likeId } }, { new: true });
        const unlike = await home.postLikes.findByIdAndDelete(likeId);
        return res.status(200).json({ message: 'post unliked succesfully' });
      } else {
        return res.status(404).json({ message: 'User has not liked that post' });
      }
    } else {
      return res.status(404).json({ message: 'User has not liked that post' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendNotification = async (device_id, message) => {
  try{
      let fcm = new FCM(process.env.FCM_SERVER_KEY);
      let pushNotification = {
          to: device_id,
          content_available: true,
          mutable_content: true,
          notification: {
              body : message
          }
      }
      fcm.send(pushNotification, (err, res) => {
          if(err){
              console.log('erorr ', err);
          }
      })
  }catch(err){
      console.log(err);
  }
}


module.exports = {
  createPost,
  getPostById,
  getAllPost,
  pushCommentsIntoPostById,
  pushLikesIntoPostById,
  getUserPostData,
  updatePostById,
  searchPodcasts,
  searchPost,
  searchChatrooms,
  searchAuthors,
  podcastsOfTheDay,
  uploadPost,
  unlikePostById,
  getTrendingPosts,
};
