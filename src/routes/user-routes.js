const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller')


// Authentication routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);



// user route
router.get('/api/users',userController.getallUsers);
//user by :id
router.get('/api/user/:id',userController.getUserbyId);
//update particular user
router.put('/api/user/:id',userController.updateUserbyId)
//Follow User
router.put('/api/user/:userId/follow/:followerId',userController.pushFollowerCount);
//Unfollow user
router.put('/api/user/:userId/unfollow/:unfollowerId',userController.unfollowUser);

// get user activity activityType can be anyone of ['my-podcast', 'my-post', 'liked-post', 'liked-podcast', 'podcast-comment', 'post-comment', 'episode']
router.get('/api/user-activity/:activityType/:userId', userController.getUserActivity);


module.exports = router;