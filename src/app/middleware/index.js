const ReportModel = require('../model/reportModel');
const TeamModel = require('../model/teamModel');
const LecturerstModel = require('../model/lecturersModel');

exports.isUpLoadFileReport = async (req, res, next) => {
    const reportId = req.headers.reportid;
    if (!reportId) {
        return res.status(401).send('Không tìm thấy ReportId!');
    }

    const report = await ReportModel.GetReportByReportId(reportId);
    if (!report) {
        return res.status(400).send('ReportId không đúng!');
    }
    req.report = report;

    return next();
};
exports.isUpdateTeam = async (req, res, next) => {
    const teamId = req.headers.teamid;
    if (!teamId) {
        return res.status(401).send('Không tìm thấy TeamId!');
    }

    const team = await TeamModel.GetTeamByTeamId(teamId);
    if (!team) {
        return res.status(400).send('teamId không đúng!');
    }
    return next();
};
exports.isUpdateLecturers = async (req, res, next) => {
    const lecturersId = req.headers.lecturersid;
    if (!lecturersId) {
        return res.status(401).send('Không tìm thấy lecturersId!');
    }

    const lecturers = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(lecturersId);
    if (!lecturers) {
        return res.status(400).send('lecturersId không đúng!');
    }
    return next();
};
