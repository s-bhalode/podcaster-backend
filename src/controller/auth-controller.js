const userSchema = require('../model/user-model');
const bcrypt = require('bcrypt');



const signUp = async (req, res) => {
    const {user_name, user_email, user_password, user_role} = req.body;

    // if(!user_email || !user_password){
    //     return res.status(400).json({message : "User email and password are required"});
    // }

    const user = await userSchema.findOne({user_email});
    if(user){
        return res.status(400).json({message: "User already exists"})
    }

    const newUser = await userSchema({user_name, user_email, user_password, user_role});
    bcrypt.hash(user_password, 7, async (err, hash) => {
        if(err){
            return res.status(400).json({message : "Error while saving password"});
        }
        newUser.user_password = hash;
        const savedUserRes = await newUser.save();
        if(savedUserRes){
            return res.status(200).json({message: "User registered successfully!"})
        }
    })
}

const signIn = async (req, res) => {
    const {user_email, user_password} = req.body;

    const user = await userSchema.findOne({user_email});
    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    const verifyPassword = await bcrypt.compare(user_password, user.user_password);
    if(verifyPassword){
        return res.status(200).json({message: "You have logged in successfully!"});
    }
    return res.status(400).json({message: 'Invalid credentials'});

}


module.exports = {
    signIn,
    signUp
}