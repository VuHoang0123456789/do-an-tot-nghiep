const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/middleware');
const AdminController = require('../app/controller/adminController');

const isAuth = authMiddleware.isAuth;

router.get('/get-stage-id', isAuth, AdminController.GetStageId);
router.get('/get-all-team', isAuth, AdminController.GetAllTeam);
router.get('/get-all-lecturers', isAuth, AdminController.GetAllLecturers);
//pairing
router.get('/get-all-pairing', isAuth, AdminController.GetAllPairing);
router.post('/create-new-pairing', isAuth, AdminController.AddNewPairing);
router.put('/update-pairing', isAuth, AdminController.UpdatePairing);
router.delete('/delete-paring', isAuth, AdminController.DeletePairing);
// router.post('/register', AdminController.RegisterAccount);
// registration
router.get('/get-all-registration', isAuth, AdminController.GetAllRegistration);
router.get('/get-registration', isAuth, AdminController.GetRegistration);
router.post('/create-new-registration', isAuth, AdminController.AddNewRegistration);
router.put('/update-registration', isAuth, AdminController.UpdateRegistration);
router.delete('/delete-registration', isAuth, AdminController.DeleteRegistration);

// stage
router.get('/get-all-stage', isAuth, AdminController.GetAllStage);
router.get('/get-stage', isAuth, AdminController.GetStage);
router.get('/get-current-stage', isAuth, AdminController.GetCurrentStages);
router.post('/create-new-stage', isAuth, AdminController.AddNewStage);
router.put('/update-stage', isAuth, AdminController.UpdateStage);
router.delete('/delete-stage', isAuth, AdminController.DeleteStage);
// statiscal
router.get('/get-all-team-statiscal', isAuth, AdminController.GetAllTeamStatiscal);
router.get('/get-all-team-statiscal-date', isAuth, AdminController.GetAllTeamStatiscalDate);
router.get('/get-all-lecturers-statiscal', isAuth, AdminController.GetAllLecturersStatiscal);
router.get('/get-all-lecturers-statiscal-date', isAuth, AdminController.GetAllLecturersStatiscalDate);
router.get('/get-all-pairing-statiscal', isAuth, AdminController.GetAllPairingStatiscal);
router.get('/get-all-team-combox', isAuth, AdminController.GetTeamCb);
router.get('/get-all-pairing-statiscal-date', isAuth, AdminController.GetAllPairingStatiscalDate);
router.get('/get-all-report-statiscal', isAuth, AdminController.GetReportStatiscal);
router.get('/get-all-report-statiscal-date', isAuth, AdminController.GetReportStatiscalDate);
// report
router.get('/get-report', isAuth, AdminController.GetReport);
router.put('/update-report', isAuth, AdminController.UpdateReport);
router.delete('/delete-report', isAuth, AdminController.DeleteReport);
module.exports = router;
