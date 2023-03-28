const userSchema = require('../model/user-model');
const bcrypt = require('bcrypt');

const getallUsers = async (req, res) => {
  try {
    const users = await userSchema.userSchema.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getUserbyId = async (req, res) => {
  try {
    const user = await userSchema.userSchema.findById(req.params.id);
    return res.json(user);
  } catch (err) {
    return res.status(404).json({ message: 'User not found' });
  }
};

const updateUserbyId = async (req, res) => {
  const { user_name, user_email, user_password, user_gender, user_contact_no, user_dob, user_profile_pic, user_instagram_url, user_facebook_url, user_twitter_url} = req.body;
  try {
    const user = await userSchema.userSchema.findById(req.params.id);
    if(user_name) user.user_name = user_name;
    if(user_email) user.user_email = user_email;
    if(user_password) user.user_password = user_password;
    if(user_gender) user.user_gender = user_gender;
    if(user_contact_no) user.user_contact_no = user_contact_no;
    if(user_dob) user.user_dob = user_dob;
    if(user_profile_pic) user.user_profile_pic = user_profile_pic;
    if(user_instagram_url) user.user_instagram_url = user_instagram_url;
    if(user_facebook_url) user.user_facebook_url = user_facebook_url;
    if(user_twitter_url) user.user_twitter_url = user_twitter_url;
    
    const updatedUser = await user.save();
    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try{
    const {userId, activityType} = req.params;
    
    const userActivity = await userSchema.userActivitySchema.find({activity_type: {$in: [activityType, userId]}}).populate('podcast_id').sort({timestamp: 'desc'}).exec();

    return res.status(200).json(userActivity);
  }catch(err){
    console.log(err);
    return res.status(400).json({message : 'Error while retrieving user activity'});
  }
}



module.exports = {
  getallUsers,
  getUserbyId,
  updateUserbyId,
  getUserActivity
};
