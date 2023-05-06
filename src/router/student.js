const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../auth/middleware');
const fileUploader = require('../config/cloudinary');
const middleware = require('../app/middleware');
const StudentController = require('../app/controller/studentController');
const studentController = require('../app/controller/studentController');

const isAuth = AuthMiddleware.isAuth;
const isUpLoadFileReport = middleware.isUpLoadFileReport;
const isUpdateTeam = middleware.isUpdateTeam;

router.get('/:slug/show-infomation', isAuth, StudentController.GetAllInfomation);
router.get('/:slug/get-team', isAuth, StudentController.GetTeam);
router.post('/:slug/register-platform', isAuth, StudentController.RegisterPlatfrom);
router.post('/:slug/upload-file', isAuth, fileUploader.single('avatar'), StudentController.UpLoadFile);
router.post('/:slug/add-new-pairing', isAuth, StudentController.AddNewParing);
router.put('/:slug/update-team', isAuth, StudentController.UpdateTeam);
router.put('/:slug/update-file', isAuth, isUpdateTeam, fileUploader.single('avatar'), StudentController.UpDateFile);
router.put('/:slug/update-pairing', isAuth, StudentController.UpdatePairing);
router.put(
    '/:slug/upload-file-report',
    isAuth,
    isUpLoadFileReport,
    fileUploader.single('uploadfile'),
    studentController.UpLoadFileReport,
);
router.put('/:slug/update-ResearchQuestion', isAuth, StudentController.UpdateResearchQuestion);
router.delete('/:slug/delete-ResearchQuestion', StudentController.DeleteResearchQuestion);
module.exports = router;
