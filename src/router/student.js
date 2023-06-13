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
const isUpLoadFileOfteam = middleware.isUpLoadFileOfteam;

router.get('/show-infomation', isAuth, StudentController.GetAllInfomation);
router.get('/show-infomation-pesonal', isAuth, StudentController.GetAllInfomationPesonal);
router.get('/get-team', isAuth, StudentController.GetTeam);
router.get('/get-team-studentid', isAuth, StudentController.GetTeamByStudentID);
router.get('/get-student', isAuth, StudentController.GetStudent);
router.get('/get-all-report', isAuth, StudentController.GetAllReport);
router.get('/get-report-reportid', isAuth, StudentController.GetReport);

router.post(
    '/upload-file',
    isAuth,
    isUpLoadFileOfteam,
    fileUploader.single('uploadfile'),
    StudentController.UpLoadFile,
);
router.post('/register-platform', isAuth, StudentController.RegisterPlatfrom);
router.post('/add-new-pairing', isAuth, StudentController.AddNewParing);

router.put('/update-team', isAuth, StudentController.UpdateTeam);
router.put('/update-researchfield', isAuth, StudentController.UpdateRearchfield);
router.put('/update-researchfield-topic-name', isAuth, StudentController.UpdateRearchfieldToppicName);
router.put('/update-research-question', isAuth, StudentController.UpdateResearchQuestion);
router.put('/update-file', isAuth, isUpdateTeam, fileUploader.single('updatefile'), StudentController.UpDateFile);
router.put(
    '/upload-file-report',
    isAuth,
    isUpLoadFileReport,
    fileUploader.single('uploadfile'),
    studentController.UpLoadFileReport,
);

router.delete('/delete-paring', isAuth, studentController.DeletePairing);
router.delete('/delete-Research-question', isAuth, StudentController.DeleteResearchQuestion);
module.exports = router;
