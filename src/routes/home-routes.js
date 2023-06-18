const express = require('express');
const homeController = require('../controller/home-controller')
const router = new express.Router();

// get All post data
router.get('/api/home/post',homeController.getAllPost);

// get post by post Id
router.get('/api/home/post/:postId',homeController.getPostById);

// create Post
router.post('/api/home/create-post/:userId',homeController.createPost)

// Update post by (post Id) also verifying user Id
router.put('/api/post/update-post/:postId/:userId',homeController.updatePostById);

// pushing comments into the post
router.post('/api/post/comment/:postId/:userId',homeController.pushCommentsIntoPostById);

// pushing likes of the post by Id
router.post('/api/post/like/:postId/:userId',homeController.pushLikesIntoPostById);

// getting the particular user post data 
router.get('/api/user/posts/:userId',homeController.getUserPostData)

//Searching Routes 

// Search Podcast
router.get('/api/podcasts/search/:term',homeController.searchPodcasts)

// Search post
router.get('/api/posts/search/:term',homeController.searchPost)

// Search chatroom
router.get('/api/chatrooms/search/:term',homeController.searchChatrooms)

// Search chatroom
router.get('/api/authors/search/:term',homeController.searchAuthors);

// get podcasts of the day
router.get('/api/podcast-of-the-day', homeController.podcastsOfTheDay);

// unlike post api
router.post('/api/post/unlike/:postId/:userId',homeController.unlikePostById)

// trending post
router.get('/api/get-trending-posts', homeController.getTrendingPosts);


module.exports = router; 