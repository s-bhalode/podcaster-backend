const express = require('express');
const router = new express.Router();
const authController = require('../controller/auth-controller');




router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);


module.exports = router;