const chatRoomService = require('../middleware/chatRoomService');


const startMeeting = (req, res, next) => {
    const {hostId, hostName} = req.body;

    let model = {
        hostId : hostId,
        hostName : hostName,
        startTime: Date.now()
    };

    chatRoomService.startMeeting(model, (err, result) => {
        if(err){
            return next(err);
        }
        return res.status(200).send({message: "Success", data : result.id});
    })
}


const checkMeetingExists = (req, res, next) => {
    const {meetingId} = req.query;

    chatRoomService.checkMeetingExists(meetingId, (err, result) => {
        if(err){
            return next(err);
        }
        return res.status(200).send({message: "Success", data: result})
    })
}

const getAllMeetingUsers = (req, res, next) => {
    const {meetingId} = req.query;

    chatRoomService.getAllMeetingUsers(meetingId, (err, result) => {
        if(err){
            return next(err);
        }
        return res.status(200).send({message: "Success", data: result});
    })

}

// const createChatRoom = async (req, res) => {
//     // room
//     const {chatTopic, roomType, ownerId} = req.body;

//     if(!chatTopic || !roomType){
//         return res.status(400).json({message: 'All fields are required!'});
//     }

//     const room = await chatRoomService.createChatRoom({
//         chatTopic,
//         roomType,
//         ownerId
//     });
//     return res.json(room);
// }

// const chatRoomIndex = async (req, res) => {
//     const rooms = await chatRoomService.getAllRooms(['public']);
    
//     return res.json(rooms);
// }

// const showChatRoom = async (req, res) => {
//     const room = await chatRoomService.getRoom(req.params.roomId);

//     return res.json(room);
// }


module.exports = {
    // createChatRoom,
    // chatRoomIndex,
    // showChatRoom

    startMeeting,
    checkMeetingExists,
    getAllMeetingUsers
}