const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/middleware');
const fileUploader = require('../config/cloudinary');
const AccountController = require('../app/controller/accountController');

const isAuth = authMiddleware.isAuth;

router.get('/get-account/:slug', isAuth, AccountController.GetAccount);
router.post('/register', AccountController.RegisterAccount);
router.put('/update-account/:slug', isAuth, AccountController.UpdateAccount);
router.put('/update-account-file/:slug', isAuth, fileUploader.single('avatar'), AccountController.UpdateFileOfAccount);
module.exports = router;
