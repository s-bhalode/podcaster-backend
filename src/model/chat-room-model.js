const mongoose = require('mongoose');


const chatRoomSchema = mongoose.model("chatRoom", new mongoose.Schema(
    {
        chatTopic : {
            type: String, 
            required : true
        },
        roomType : {
            type: String,
            required: true
        },
        ownerId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'user'
        },
        speakers : [{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'user',
            required: true
        }],
        participants : [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    },
    {
        timestamps: true
    }
));


module.exports = chatRoomSchema;