const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');
const { auth } = require('firebase-admin');


// Authentication routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);

// to trigger email for changing password
router.post('/api/forgot-password', authController.forgotPassword);
// to change password
router.post('/api/change-password/:userId', authController.changePassword);



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


// to save content send contentType as 'post' or 'podcast' or 'episode' and contentId
router.post('/api/user-save-content/:userId', userController.saveContent);

// to remove content from saved send contentType as 'post' or 'podcast' or 'episode' and contentId
router.post('/api/remove-saved-content/:userId', userController.removeFromSaved);

// add to favorites send contentType as 'post' or 'podcast' or 'episode' and contentId
router.post('/api/user-add-to-favorites/:userId', userController.addToFavorites);

// to remove content from favorites send contentType as 'post' or 'podcast' or 'episode' and contentId
router.post('/api/remove-favorites-content/:userId', userController.removeFromFavorites);

// to add user interest
router.post('/api/:userId/add-interest', userController.addUserInterest);

// for podcast recommendations
router.get('/api/:userId/podcast-recommendations', userController.podcastRecommendation);





module.exports = router;