const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');
const { auth } = require('firebase-admin');


// Authentication routes
router.post('/signup', authController.signUp);
// router.post('/signin', authController.signIn);
router.post('/signin', authController.login);

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

// for qoutes recommendations
router.get('/api/:userId/post-recommendations', userController.postRecommendation);

// to get user collections
router.get('/api/get-all-collection-name/:userId', userController.getAllCollectionName);

// to get individual collection data
router.get('/api/get/:collection_name/data/:userId', userController.getCollectionData);

// to save item to userCollections send itemType as 'post' or 'podcast' or 'episode' and itemId
router.post('/api/save-to-collections/:userId', userController.saveToCollections);

// to remove item from userCollections send itemId 
router.post('/api/remove-from-collections/:id', userController.removeFromCollections);

// to get user played history
router.get('/api/get-all-played-history/:userId', userController.getAllPlayedHistory);

// to add episode to user_played_history
router.post('/api/add-to-played-history/:userId', userController.addToPlayedHistory);

// to remove episode from user_played_history
router.post('/api/remove-from-played-history/:userId', userController.removeFromPlayedHistory);

// to get download history
router.get('/api/get-all-downloads/:userId', userController.getAllDownloads);

// to add episode to downloads
router.post('/api/add-to-downloads/:userId', userController.addToDownloads);

// to remove episode from downloads
router.post('/api/remove-from-downloads/:userId', userController.removeFromDownloads);



module.exports = router;