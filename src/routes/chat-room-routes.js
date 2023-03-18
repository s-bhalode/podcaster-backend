const express = require('express');
const router = new express.Router();
const chatRoomController = require('../controller/chat-room-controller');




// create chat room
router.post('/create/chat-room', chatRoomController.createChatRoom);
router.get('/get-all-room-index', chatRoomController.chatRoomIndex);
router.get('/get-specific-chat-room/:roomId', chatRoomController.showChatRoom);


module.exports = router;