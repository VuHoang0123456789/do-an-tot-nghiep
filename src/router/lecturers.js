const express = require('express');
const router = express.Router();
const fileUploader = require('../config/cloudinary');
const authMidelleware = require('../auth/middleware');
const middleware = require('../app/middleware');
const LecturersController = require('../app/controller/lecturersController');

const isAuth = authMidelleware.isAuth;
const isUpdateLecturers = middleware.isUpdateLecturers;
const isUpLoadFileOfLecturers = middleware.isUpLoadFileOfLecturers;

router.get('/get-all-lecturers/pairing-1', isAuth, LecturersController.GetAllLecturersRegistedFirt);
router.get('/get-all-lecturers/pairing-2', isAuth, LecturersController.GetAllLecturersRegistedLast);
router.get('/get-all-team', isAuth, LecturersController.GetAllTeam);
router.get('/get-infro-lecturers', isAuth, LecturersController.GetInfomationLectures);
router.get('/get-infro-lecturers-pesonal', isAuth, LecturersController.GetInfomationLecturesPesonal);
router.get('/get-lecturers', isAuth, LecturersController.GetLecturers);
router.get('/get-lecturers-platfrom', isAuth, LecturersController.GetLecturersPlatform);
router.get('/get-lecturers-registed', isAuth, LecturersController.GetLecturersRegisted);
router.get('/get-all-report', isAuth, LecturersController.GetAllReport);
router.get('/get-report-reportid', isAuth, LecturersController.GetReport);

router.post('/register-platform', isAuth, LecturersController.RegisterPlatfrom);
router.post(
    '/upload-file',
    isAuth,
    isUpLoadFileOfLecturers,
    fileUploader.array('uploadfile', 2),
    LecturersController.UpLoadFile,
);
router.post('/create-new-reports', isAuth, LecturersController.AddNewReports);
router.post('/create-new-report', isAuth, LecturersController.AddNewReport);
router.put(
    '/update-file',
    isAuth,
    isUpdateLecturers,
    fileUploader.single('uploadfile'),
    LecturersController.UpdateFile,
);

router.put('/update-report', isAuth, LecturersController.UpdateReport);
router.put('/update-pairing', isAuth, LecturersController.UpdatePairing);
router.put('/update-lecturers', isAuth, LecturersController.UpdateLecturers);

router.delete('/delete-report', isAuth, LecturersController.DeleteReport);
router.delete('/delete-paring', isAuth, LecturersController.DeletePairing);
module.exports = router;
