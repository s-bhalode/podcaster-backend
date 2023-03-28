const userSchema = require('../model/user-model');
const bcrypt = require('bcrypt');

const getallUsers = async (req, res) => {
  try {
    const users = await userSchema.userSchema.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserbyId = async (req, res) => {
  try {
    const user = await userSchema.userSchema.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserbyId = async (req, res) => {
  const { user_name, user_email, user_password, isPublic } = req.body;
  try {
    const user = await userSchema.userSchema.findById(req.params.id);
    if (user_name) user.user_name = user_name;
    if (user_email) user.user_email = user_email;
    if (user_password) user.user_password = user_password;
    if (isPublic !== undefined) user.isPublic = isPublic;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try{
    const {userId} = req.params;
    const userActivity = await userSchema.userActivitySchema.find({userId}).sort({timestamp: 'desc'});

    return res.status(200).json(userActivity);

  }catch(err){
    console.log(err);
    return res.status(400).json({message : 'Error while retrieving user activity'});
  }
}

const addUserActivity = async (req, res) => {
  try{
    const {userId} = req.params;

    const {activity_type, podcast_id} = req.body;
    const userActivity = new userSchema.userActivitySchema({userId, activity_type, podcast_id});
    await userActivity.save();

    return res.status(201).json({message: 'User activity created successfully'});

  }catch(err){
    console.log(err);
    return res.status(400).json({message: 'Error while creating user activity'});
  }
}


module.exports = {
  getallUsers,
  getUserbyId,
  updateUserbyId,
  getUserActivity,
  addUserActivity
};
