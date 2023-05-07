const express = require('express');
const router = express.Router();
const fileUploader = require('../config/cloudinary');
const authMidelleware = require('../auth/middleware');
const middleware = require('../app/middleware');
const LecturersController = require('../app/controller/lecturersController');

const isAuth = authMidelleware.isAuth;
const isUpdateLecturers = middleware.isUpdateLecturers;

router.get('/:slug/get-all-lecturers', isAuth, LecturersController.GetAllLecturersRegisted);
router.get('/:slug/get-all-team', isAuth, LecturersController.GetAllTeam);
router.get('/:slug/get-infro-lecturers', isAuth, LecturersController.GetInfomationLectures);
router.post('/:slug/register-platform', isAuth, LecturersController.RegisterPlatfrom);
router.post('/:slug/upload-file', isAuth, fileUploader.array('uploadfile', 2), LecturersController.UpLoadFile);
router.post('/:slug/create-new-report', isAuth, LecturersController.AddNewReport);
router.get('/:slug/get-all-report', isAuth, LecturersController.GetAllReport);
router.put(
    '/:slug/update-file',
    isAuth,
    isUpdateLecturers,
    fileUploader.array('uploadfile', 2),
    LecturersController.UpdateFile,
);
router.delete('/:slug/delete-paring', isAuth, LecturersController.DeletePairing);
router.put('/:slug/update-lecturers', isAuth, LecturersController.UpdateLecturers);
module.exports = router;
