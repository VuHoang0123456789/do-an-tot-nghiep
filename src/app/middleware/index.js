const ReportModel = require('../model/reportModel');
const TeamModel = require('../model/teamModel');
const LecturerstModel = require('../model/lecturersModel');

exports.isUpLoadFileReport = async (req, res, next) => {
    const teamId = req.headers.teamid;
    const stageId = req.headers.stageid;

    if (!teamId || !stageId) {
        return res.status(404).json({ msg: 'not found' });
    }

    const report = await ReportModel.GetReportByTeamIdAndStageId(teamId, stageId);
    if (!report) {
        return res.status(400).json({ msg: 'không tìm thấy report!' });
    }

    req.report = report;
    return next();
};

exports.isUpLoadFileOfLecturers = async (req, res, next) => {
    const IsLecturersRegistered = await LecturerstModel.GetLecturersByLecturersRegistedIdAndLecturersId(
        req.headers.lecturersid,
    );

    if (IsLecturersRegistered) {
        return res.status(400).json({ msg: 'Bạn đã đăng ký vào platform rồi.' });
    }

    return next();
};
exports.isUpLoadFileOfteam = async (req, res, next) => {
    // kiểm tra thông tin
    if (!req.headers.teamname) {
        return res.status(400).json({ msg: 'Không tìm thấy tên nhóm' });
    }

    if (!req.headers.studentid) {
        return res.status(400).json({ msg: 'Không tìm thấy mã sinh viên' });
    }

    // Kiểm tra xem sinh viên đã đăng ký vào platfrom chưa nếu có rồi thì không cho đăng ký nữa
    const isTeam = await TeamModel.GetTeamByStudentId(req.headers.studentid);
    if (isTeam) {
        return res.status(400).json({ msg: 'Sinh viên đã có nhóm, không thể đăng ký thêm.' });
    }

    // Kiểm tra tên nhóm
    if (await TeamModel.GetTeamByTeamName(req.headers.teamname)) {
        return res.status(400).json({ msg: 'Tên nhóm đã tồn tại, vui lòng chọn tên khác.' });
    }

    return next();
};
exports.isUpdateTeam = async (req, res, next) => {
    const teamId = req.headers.teamid;
    if (!teamId) {
        return res.status(400).json({ msg: 'Không tìm thấy TeamId!' });
    }

    const team = await TeamModel.GetTeamByTeamId(teamId);
    if (!team) {
        return res.status(400).json({ msg: 'teamId không đúng!' });
    }
    return next();
};
exports.isUpdateLecturers = async (req, res, next) => {
    const lecturersId = req.headers.lecturersid;
    if (!lecturersId) {
        return res.status(400).json({ msg: 'Không tìm thấy lecturersId!' });
    }

    const lecturers = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(lecturersId);
    if (!lecturers) {
        return res.status(400).json({ msg: 'lecturersId không đúng!' });
    }
    return next();
};
