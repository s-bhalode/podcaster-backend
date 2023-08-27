const express = require('express');
const router = new express.Router();
const adminController = require('../controller/admin-controller')

router.get('/api/admin/dashboard/get-all-user-details',adminController.getalluserData)




module.exports = router;