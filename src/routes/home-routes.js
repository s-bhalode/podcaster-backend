const express = require('express');
const homeController = require('../controller/home-controller')
const router = new express.Router();

// get All post data
router.get('/api/home',homeController.getAllPost);

// get post by post Id
router.get('/api/home/post/:id',homeController.getPostById);

// create Post
router.post('/api/home/create-post',homeController.createPost)

// Update post by (post Id) also verifying user Id
router.put('/api/post/update-post/:id',homeController.updatePostById);

// pushing comments into the post
router.post('/api/post/:id/comment',homeController.pushCommentsIntoPostById);

// pushing likes of the post by Id
router.post('/api/post/:id/like',homeController.pushLikesIntoPostById);

// getting the particular user post data 
router.get('/api/user/:id/post',homeController.getUserPostData)

module.exports = router; 