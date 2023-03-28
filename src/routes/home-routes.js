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


module.exports = router; 