const userSchema = require("../model/user-model");
const postSchema = require('../model/home-model');
const podcastSchema = require('../model/podcast-model');

const getalluserData = async (req, res) => {
    try {
        const users = await userSchema.userSchema.find().select('verified _id user_name user_email user_password user_role is_public registered_date followers following intrests user_profile_pic user_downloads').exec();
        if(!users) return res.status(201).json({message : "No users"});

        return res.status(200).json(users);
    } catch (error) {
        return res.status(422).json(error.message);
    }
}

const getPostCount = async (req, res) => {
    try{
        const postCount = await postSchema.postSchema.count();
        res.status(200).json(postCount);
    }catch(error){
        console.log(error);
        return res.status(422).json(error.message);
    }
}
const getUserCount = async (req, res) => {
    try{
        const userCount = await userSchema.userSchema.count();
        res.status(200).json(userCount);
    }catch(error){
        console.log(error);
        return res.status(422).json(error.message);
    }
}

const getPodcastCount = async (req, res) => {
    try{
        const podcastCount = await podcastSchema.podcastSchema.count();
        res.status(200).json(podcastCount);
    }catch(error){
        console.log(error);
        return res.status(422).json(error.message);
    }
}

module.exports={
 getalluserData,
 getPostCount,
 getPodcastCount,
 getUserCount
}