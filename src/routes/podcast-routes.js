const express = require('express');
const { getPodcastById } = require('../controller/podcast-controller');
const router = new express.Router();
const podcastController = require('../controller/podcast-controller');

//create podcast
router.post('/api/create-podcast', podcastController.createPodcast);

//Get All podcasts Data
router.get('/api/podcasts', podcastController.getAllPodcast);

// get podcast by Id
router.get('/api/podcasts/:id', podcastController.getPodcastById);

//Update the particular podcast by id
router.put('/api/podcast/update-podcast/:id',podcastController.updatePodcastById);

//pushing comments into the podcast
router.post('/api/podcast/:id/comment',podcastController.pushCommentsIntoPodcastbyId);

module.exports = router;
