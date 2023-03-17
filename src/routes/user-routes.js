const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');
const chatRoomController = require('../controller/chat-room-controller');




router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);


// create chat room
router.post('/create/chat-room', chatRoomController.createChatRoom);
router.get('/get-all-room-index', chatRoomController.chatRoomIndex);
router.get('/get-specific-chat-room/:roomId', chatRoomController.showChatRoom);


module.exports = router;