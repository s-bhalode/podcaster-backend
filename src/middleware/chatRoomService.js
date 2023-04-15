const chatRoomSchema = require('../model/chat-room-model');
const user = require('../model/user-model');


const getAllMeetingUsers = async (meetId, callback) => {
    user.userSchema.find({meetingId: meetId})
    .then((res) => {
        return callback(null, res);
    })
    .catch((err) => {
        return callback(err);
    })
}

const startMeeting = async (params, callback) => {
    const chatRoom = new chatRoomSchema(params);
    chatRoom
    .save()
    .then((res) => {
        return callback(null, res);
    })
    .catch((err) => {
        return callback(err);
    })
}

const joinMeeting = async (params, callback) => {
    const userModel = new user.userSchema(params);

    userModel
    .save()
    .then(async (res) => {
        await chatRoomSchema.findByIdAndUpdate({id: params.meetingId}, {$addToSet: {"meetingUsers" : userModel}});
        return callback(null, res);
    })
    .catch((err) => {
        return callback(err);
    })
}

const isMeetingPresent = async (meetingId, callback) => {
    chatRoomSchema.findById(meetingId)
    .populate("participants", "speakers")
    .then((res) => {
        if(!res){
            callback("Invalid Meeting Id");
        }else{
            callback(null, true);
        }
    })
    .catch((err) => {
        return callback(err, false);
    })
}

const checkMeetingExists = async (meetingId, callback) => {
    chatRoomSchema.findById(meetingId, "hostId", "startTime")
    .populate("participants", "speakers")
    .then((res) => {
        if(!res){
            callback("Invalid Meeting Id");
        }else{
            callback(null, true);
        }
    })
    .catch((err) => {
        return callback(err, false);
    })
}

const getMeetingUser = async (params, callback) => {
    const {meetingId, userId} = params;
    
    user.userSchema.find({meetingId, userId})
        .then((res) => {
            return callback(null, res[0]);
        })
        .catch((err) => {
            return callback(err);
        })
}

const updateMeetingUser = async (params, callback) => {
    user.userSchema.updateOne({userId : params.userId}, {$set: params}, {new: true})
        .then((res) => {
            return callback(null, res);
        })
        .catch((err) => {
            return callback(err);
        })
}

const getUserBySocketId = async (params, callback) => {
    const {meetingId, socketId} = params;

    user.userSchema.find({meetingId, socketId}).limit(1)
        .then((res) => {
            return callback(null, res);
        })
        .catch((err) => {
            return callback(err);
        })
}

// const createChatRoom = async (payload) => {

//     // chatTopic means room title or topic title
//     // roomType associates with public room or private room
//     // ownerId assiciates with the user Id who is creating a chat room

//     const {chatTopic, roomType, ownerId} = payload;
//     const room = await chatRoomSchema.create({
//         chatTopic,
//         roomType,
//         ownerId,
//         speakers : [ownerId]
//     });

//     return room;
// }

// const getAllRooms = async (types) => {
//     const rooms = await chatRoomSchema.find({roomType: {$in: types}})
//         .populate('speakers')
//         .populate('ownerId')
//         .exec();

//     return rooms;
// }

// const getRoom = async (roomId) => {
//     const room = await chatRoomSchema.findOne({_id: roomId});

//     return room;
// }


module.exports = {
    // createChatRoom,
    // getAllRooms,
    // getRoom

    startMeeting,
    joinMeeting,
    getAllMeetingUsers,
    getMeetingUser,
    isMeetingPresent,
    checkMeetingExists,
    getUserBySocketId,
    updateMeetingUser
}