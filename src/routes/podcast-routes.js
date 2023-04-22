const express = require('express');
const router = new express.Router();
const podcastController = require('../controller/podcast-controller');

//create podcast
router.post('/api/create-podcast/:userId', podcastController.createPodcast);

//create Episode
router.post('/api/podcasts/create-episode/:podcastId/:userId',podcastController.createEpisodes)

//Get All podcasts Data
router.get('/api/podcasts', podcastController.getAllPodcast);

//Get All podcast details by Category (filtered)
router.get('/api/podcasts/:category',podcastController.getPodcastbyCategory);

// get podcast by Id
router.get('/api/podcast/:podcastId', podcastController.getPodcastById);

//Update the particular podcast by id
router.put('/api/podcast/update-podcast/:userId/:podcastId',podcastController.updatePodcastById);

//pushing comments into the podcast
router.post('/api/podcast/comment/:userId/:podcastId',podcastController.pushCommentsIntoPodcastbyId);

//pushing likes of the podcast by Id
router.post('/api/podcast/like/:userId/:podcastId',podcastController.pushLikesIntoPodcastbyId);

// getting the particular user podcast data 
router.get('/api/user/:userId/podcast',podcastController.getUserPodcastData)


// to get all the required authors
router.get('/api/get-all-authors', podcastController.getAllPodcastAuthors);

// to get episode by id
router.get('/api/get-episode/:episodeId', podcastController.getEpisodeById);

// to get 20 recent episodes 
router.get('/api/get-twenty-recent-episode', podcastController.getRecentEpisodes);

// unlike podcast
router.post('/api/podcast/unlike/:userId/:podcastId',podcastController.unlikePodcastById)

module.exports = router;
