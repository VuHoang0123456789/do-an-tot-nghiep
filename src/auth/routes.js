const express = require('express');
const router = express.Router();
const AuthController = require('./controller');

router.post('/login', AuthController.Login);
router.post('/refresh', AuthController.Refresh);
router.post('/send-otp', AuthController.SendOTP);
module.exports = router;
