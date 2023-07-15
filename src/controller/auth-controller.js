const userSchema = require("../model/user-model");
const bcrypt = require("bcrypt");
const awsEmailNotification = require('../config/ses');
const {OAuth2Client} = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config({path: '../../.env'});
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const keys = require('../../google_app_credentials.json');



const verifyToken = async (client, token) => { 

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID
    })
    // // const payload = ticket.getPayload();
    return ticket.getPayload();
    // const userid = payload['sub'];
    // verify().catch(console.error);
}

const login = async (req, res) => {
  try {
    const { user_email, user_password, device_token } = req.body;
    let token = req.query.id_token;

    if(!user_password){
      const client = new OAuth2Client(process.env.CLIENT_ID);
      let user = await verifyToken(client, token).catch((err) => {
        console.log('errorrrr', err);
      });
      console.log('user ', user);
      if(user.user_email.verified){
        userSchema.userSchema.find({user_email: user.user_email}).toArray((err, result) => {
          if(err){
            throw err;
          }
          if(result.length< 1){
            userSchema.userSchema.insert([{
              user_email : user.email,
              user_password: bcrypt.hash(user.at_hash, 7)
            }])
            userSchema.userSchema.findOneAndUpdate({user_email:user.user_email}, {device_token: device_token}, (err, updatedUser)=>{
              if(err){
                throw err;
              }
            })
            userSchema.userSchema.find({user_email: user.user_email}).toArray((error, resu) => {
              if(error){
                throw error;
              }
              let token = jwt.sign({user: user}, process.env.JWT_SECRET_KEY);
              res.status(202).json({
                auth : true,
                token : token
              })
            })
          }else{
            let token = jwt.sign({user: user}, process.env.JWT_SECRET_KEY);
            res.status(202).json({auth: true, token: token});
          }
        })
      }else{
        res.status(422).json({
          auth: false,
          message: "Unauthorized user"
        })
      }
    }else{
      const user = await userSchema.userSchema.findOne({ user_email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const verifyPassword = bcrypt.compareSync(
        user_password,
        user.user_password
      );
      if (verifyPassword) {
        const jsonToken = jwt.sign({user: user}, process.env.JWT_SECRET_KEY);
        return res
          .status(200)
          .json({ message: "You have logged in successfully!", user: user});
      }
      return res.status(400).json({ message: "Invalid credentials" });
    }
  }catch(err){
    console.log(err);
    return res.status(500).json({ message: "Error while login" });
  }
}


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
    let token = '';
    const newUser = await userSchema.userSchema({
      token,
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
    bcrypt.hash(user_password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(400).json({ message: "Error while saving password" });
      }
      newUser.user_password = hash;
      newUser.token = jwt.sign({user: newUser}, process.env.JWT_SECRET_KEY);
      const savedUserRes = await newUser.save();
      if (savedUserRes) {
        return res
          .status(200)
          .json({
            message: "User registered successfully!",
            user: savedUserRes
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
  login
};
