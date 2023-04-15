const express = require('express');
const router = new express.Router();
const chatRoomController = require('../controller/chat-room-controller');


router.post('/chat-room/create', chatRoomController.startMeeting);
router.get('/chat-room/join', chatRoomController.checkMeetingExists);

router.get('/chat-room/get', chatRoomController.getAllMeetingUsers);


// create chat room
// router.post('/create/chat-room', chatRoomController.createChatRoom);

// // to get all available chat rooms
// router.get('/get-all-room-index', chatRoomController.chatRoomIndex);

// // to get or enter specific chat room
// router.get('/get-specific-chat-room/:roomId', chatRoomController.showChatRoom);


module.exports = router;