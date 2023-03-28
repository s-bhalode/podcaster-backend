const userSchema = require('../model/user-model');
const home = require('../model/home-model');

const createPost = async (req, res) => {
  const { description, images, is_Public, bgms, created_at } = req.body;
  const {userId} = req.params;
  const user_id = userId;
  try {
    const newPost = await home.postSchema.create({
      description,
      user_id,
      images,
      is_Public,
      bgms,
      created_at,
    });
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
  try {
    const newComment = new home.postComments({
      user_id,
      content,
    });

    const savedComment = await newComment.save();
    const post = await home.postSchema.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    }else{
      post.comments.push(savedComment._id); 
      const updatedpost = await post.save();
      return res.status(200).json(updatedpost);
    }
   
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const pushLikesIntoPostById = async (req, res) => {
  console.log(req.body);
  const { userId, postId} = req.params;
  const user_id = userId;
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

module.exports = {
  createPost,
  getPostById,
  getAllPost,
  pushCommentsIntoPostById,
  pushLikesIntoPostById,
  getUserPostData,
  updatePostById,
};
