const chatRoomSchema = require('../model/chat-room-model');

const createChatRoom = async (payload) => {

    // chatTopic means room title or topic title
    // roomType associates with public room or private room
    // ownerId assiciates with the user Id who is creating a chat room

    const {chatTopic, roomType, ownerId} = payload;
    const room = await chatRoomSchema.create({
        chatTopic,
        roomType,
        ownerId,
        speakers : [ownerId]
    });

    return room;
}

const getAllRooms = async (types) => {
    const rooms = await chatRoomSchema.find({roomType: {$in: types}})
        .populate('speakers')
        .populate('ownerId')
        .exec();

    return rooms;
}

const getRoom = async (roomId) => {
    const room = await chatRoomSchema.findOne({_id: roomId});

    return room;
}


module.exports = {
    createChatRoom,
    getAllRooms,
    getRoom
}