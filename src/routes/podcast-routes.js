const express = require('express');
const router = new express.Router();
const podcastController = require('../controller/podcast-controller');

//create podcast
router.post('/api/create-podcast', podcastController.createPodcast);

//Get All podcasts Data
router.get('/api/podcasts', podcastController.getAllPodcast);

//Get All podcast details by Category (filtered)
router.get('/api/podcasts/:id/:category',podcastController.getPodcastbyCategory);

// get podcast by Id
router.get('/api/podcast/:id', podcastController.getPodcastById);

//Update the particular podcast by id
router.put('/api/podcast/update-podcast/:id',podcastController.updatePodcastById);

//pushing comments into the podcast
router.post('/api/podcast/comment/:id',podcastController.pushCommentsIntoPodcastbyId);

//pushing likes of the podcast by Id
router.post('/api/podcast/like/:id',podcastController.pushLikesIntoPodcastbyId);

// getting the particular user podcast data 
router.get('/api/user/:id/podcast',podcastController.getUserPodcastData)



module.exports = router;
