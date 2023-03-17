const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller')
const chatRoomController = require('../controller/chat-room-controller');


// Authentication routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);

// Podcast work (episode,bgms,like,comment )

// user route
router.get('/api/users',userController.getallUsers);
//user by :id
router.get('/api/user/:id',userController.getUserbyId);
//update particular user
router.put('/api/user/:id',userController.updateUserbyId)

// create chat room
router.post('/create/chat-room', chatRoomController.createChatRoom);
router.get('/get-all-room-index', chatRoomController.chatRoomIndex);
router.get('/get-specific-chat-room/:roomId', chatRoomController.showChatRoom);


module.exports = router;