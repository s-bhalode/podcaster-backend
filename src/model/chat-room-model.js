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
        hostId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'user'
        },
        hostName : {
            type : String,
            required: false
        },
        startTime: {
            type: Date,
            required: true
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
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toString(),
                delete ret._id;
                delete ret.__v;
            }
        }
    },
    {
        timestamps: true
    }
));


module.exports = chatRoomSchema;