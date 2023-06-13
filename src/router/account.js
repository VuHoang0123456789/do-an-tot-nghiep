const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/middleware');
const fileUploader = require('../config/cloudinary');
const AccountController = require('../app/controller/accountController');

const isAuth = authMiddleware.isAuth;

router.get('/get-account', isAuth, AccountController.GetAccount);
router.post('/register', AccountController.RegisterAccount);
router.put('/update-account', isAuth, AccountController.UpdateAccount);
router.put('/forgot-password', AccountController.ForgotPassWord);
router.put('/update-account-file', isAuth, fileUploader.single('avatar'), AccountController.UpdateFileOfAccount);
module.exports = router;
