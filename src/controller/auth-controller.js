const userSchema = require("../model/user-model");
const bcrypt = require("bcrypt");
const awsEmailNotification = require('../config/aws-config');

const signUp = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_password,
      user_role,
      user_gender,
      user_contact_no,
      user_dob,
      user_profile_pic,
      user_instagram_url,
      user_facebook_url,
      user_twitter_url,
    } = req.body;

    // if(!user_email || !user_password){
    //     return res.status(400).json({message : "User email and password are required"});
    // }

    const user = await userSchema.userSchema.findOne({ user_email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await userSchema.userSchema({
      user_name,
      user_email,
      user_password,
      user_role,
      user_gender,
      user_contact_no,
      user_dob,
      user_profile_pic,
      user_instagram_url,
      user_facebook_url,
      user_twitter_url,
    });
    bcrypt.hash(user_password, 7, async (err, hash) => {
      if (err) {
        return res.status(400).json({ message: "Error while saving password" });
      }
      newUser.user_password = hash;
      const savedUserRes = await newUser.save();
      if (savedUserRes) {
        return res
          .status(200)
          .json({
            message: "User registered successfully!",
            newUser: savedUserRes,
          });
      }
    });
  } catch (err) {
    return res.status(400).json({ message: "Error while registering user" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { user_email } = req.body;
    const origin = req.header('Origin');
    const user = await userSchema.userSchema.findOne({ user_email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    awsEmailNotification.sendForgotPasswordEmail(user_email, user._id, origin);

    return res.status(202).json(user._id);
  } catch (err) {
    return res.status(400).json({ message: "Error occurred" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const { userId } = req.params;

    bcrypt.hash(new_password, 7, async (err, hash) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error while updating password" });
      }

      const updatedUser = await userSchema.userSchema.findByIdAndUpdate(
        userId,
        {
          user_password: hash,
        },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(400).json({ message: "Error while updating password" });
      }

      return res.status(202).json({ message: "Password changed successfully" });
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

const signIn = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const user = await userSchema.userSchema.findOne({ user_email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const verifyPassword = await bcrypt.compare(
      user_password,
      user.user_password
    );
    if (verifyPassword) {
      return res
        .status(200)
        .json({ message: "You have logged in successfully!", user: user });
    }
    return res.status(400).json({ message: "Invalid credentials" });
  } catch (err) {
    return res.status(500).json({ message: "Error while login" });
  }
};

module.exports = {
  signIn,
  signUp,
  forgotPassword,
  changePassword,
};
