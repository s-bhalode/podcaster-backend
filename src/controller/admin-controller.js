const userSchema = require("../model/user-model");

const getalluserData = async (req, res) => {
    try {
        const users = await userSchema.userSchema.find().select('verified _id user_name user_email user_password user_role is_public registered_date followers following intrests user_profile_pic user_downloads').exec();
        if(!users) return res.json({message : "No users"});

        return res.status(200).json(users);
    } catch (error) {
        return res.json(error);
    }
}

module.exports={
 getalluserData
}