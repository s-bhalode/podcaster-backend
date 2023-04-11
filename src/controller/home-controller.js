const userSchema = require('../model/user-model');
const home = require('../model/home-model');
const Podcast = require('../model/podcast-model');
const Chatroom = require('../model/chat-room-model')
const createPost = async (req, res) => {
  const { description, images, is_Public, bgms, created_at } = req.body;
  const {userId} = req.params;
  const user_id = userId;
  const activity_type = 'my-posts';
  try {
    const newPost = await home.postSchema.create({
      description,
      user_id,
      images,
      is_Public,
      bgms,
      created_at,
    });
    const post_id = newPost._id;
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      post_id
    })
    return res.status(200).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPostById = async (req, res) => {
  const {postId} = req.params;
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
      });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }else{
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
      .find()
      .populate('user_id')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
        },
      });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }else{
      return res.status(200).json(post);
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const pushCommentsIntoPostById = async (req, res) => {
  console.log(req.body);
  const { content, userId, postId } = req.params;
  const user_id = userId;
  const post_id = postId;
  const activity_type = 'post-comment';
  try {
    const newComment = new home.postComments({
      user_id,
      content,
    });
    await userSchema.userActivitySchema.create({
      user_id,
      activity_type,
      post_id
    })
    const savedComment = await newComment.save();
    const post = await home.postSchema.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    }else{
      post.comments.push(savedComment._id); 
      const updatedpost = await post.save();
      return res.status(200).json(updatedpost);
    }
   
  }catch (err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const pushLikesIntoPostById = async (req, res) => {
  console.log(req.body);
  const { userId, postId} = req.params;
  const user_id = userId;
  const post_id = postId;
  const activity_type = 'liked-post';
  try {
    const newLikes = new home.postLikes({
      user_id,
    });
    
    const savedLikes = await newLikes.save();
    const post = await home.postSchema.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    }else{
      post.likes.push(savedLikes._id);
      const pushedLikes = await post.save();
      await userSchema.userActivitySchema.create({
        user_id,
        activity_type,
        post_id
      })
      return res.status(200).json(pushedLikes);
    }
   
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserPostData = async (req, res) => {
  const {userId} = req.params;
  try {
    const post = await home.postSchema.findOne({ user: userId });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
    }else{
      return res.status(200).json(post);
    }
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePostById = async (req, res) => {
  const { description, images, is_Public, bgms} = req.body;
  const {userId, postId} = req.params;
  const user_id =userId;
  const post = await home.postSchema.findById(postId).populate('user_id');
  if (!post) {
    return res.status(404).json({ message: 'post not found' });
  } else if (post.user._id.toString() !== userId) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to update this post' });
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


const searchPodcasts = async (req, res) =>{
  const {term} = req.params; 
  const query = new RegExp(term, 'i');
 try{ 
  const podcast = await Podcast.podcastSchema.find({ $or : [{title : query}, { description: query }]}).populate('user_id').populate('episode').exec();
  if(!podcast){
    return res.status(404).json({message : "No search result found!!"})
  }
  return res.status(200).json(podcast);
 } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
}
const searchPost = async (req, res) =>{
  const {term} = req.params; 
  const query = new RegExp(term, 'i');
 try{ 
  const podcast = await home.postSchema.find({ $or : [{ description: query }]}).populate('user_id').exec();
  if(!podcast){
    return res.status(404).json({message : "No search result found!!"})
  }
  return res.status(200).json(podcast);
 } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
}

const searchChatrooms = async (req, res) =>{
  const {term} = req.params; 
  console.log(term)
  const query = new RegExp(term, 'i');
 try{ 
  const podcast = await Chatroom.find({ $or : [{ chatTopic: query }]}).populate('ownerId').exec();
  if(!podcast){
    return res.status(404).json({message : "No search result found!!"})
  }
  return res.status(200).json(podcast);
 } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
}

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
  const {term} = req.params; 
  console.log(term)
  // const query = new RegExp(term, 'i');
  try{
    const authors = await Podcast.podcastSchema.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author"
        }
      },
      {
        $unwind: "$author"
      },
      {
        $match: {
          $or: [
            { "author.user_name": { $regex: term, $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: "$user_id",
          author: { $addToSet: "$author" },
        }
      }
    ])
    if(!authors){
      return res.status(500).json("No search result found!!");
    }
    return res.status(202).json(authors);
  }catch(err){
    console.log(err);
    return res.status(400).json("Internal server error");
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
  searchAuthors
};
