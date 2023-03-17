const chatRoomService = require('../middleware/chatRoomService');


const createChatRoom = async (req, res) => {
    // room
    const {chatTopic, roomType, ownerId} = req.body;

    if(!chatTopic || !roomType){
        return res.status(400).json({message: 'All fields are required!'});
    }

    const room = await chatRoomService.createChatRoom({
        chatTopic,
        roomType,
        ownerId
    });
    return res.json(room);
}

const chatRoomIndex = async (req, res) => {
    const rooms = await chatRoomService.getAllRooms(['public']);
    
    return res.json(rooms);
}

const showChatRoom = async (req, res) => {
    const room = await chatRoomService.getRoom(req.params.roomId);

    return res.json(room);
}


module.exports = {
    createChatRoom,
    chatRoomIndex,
    showChatRoom
}