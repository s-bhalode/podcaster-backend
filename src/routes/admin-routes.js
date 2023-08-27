const express = require('express');
const router = new express.Router();
const adminController = require('../controller/admin-controller')

router.get('/api/admin/dashboard/get-all-user-details',adminController.getalluserData);

router.get('/api/admin/dashboard/get-post-count',adminController.getPostCount);

router.get('/api/admin/dashboard/get-podcast-count',adminController.getPodcastCount);

router.get('/api/admin/dashboard/get-user-count',adminController.getUserCount);




module.exports = router;