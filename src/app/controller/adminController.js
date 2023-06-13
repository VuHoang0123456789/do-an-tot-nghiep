const PairingModel = require('../model/PairingModel');
const adminModel = require('../model/adminModel');
const lecturersModel = require('../model/lecturersModel');
const ResearchQuestionModel = require('../model/rearchQuestionModel');

class AdminController {
    async GetStageId(req, res, next) {
        const stageId = await adminModel.GetStageId();
        const stages = await adminModel.GetStageAll();

        if (stages.length === 0 || !stageId) {
            return res.status(404).json({ msg: 'Không tìm thấy stage' });
        }
        const Id = stages.filter((item) => item.Id === stageId.Id);
        return res.status(200).json(Id);
    }
    // pairing
    // [GET] /get-all-paing
    async GetAllPairing(req, res, next) {
        const pairing = await adminModel.GetPairings();

        if (pairing.length === 0) {
            return res.status(204).json({ msg: 'Không tìm thấy cặp' });
        }

        return res.status(200).json(pairing);
    }
    // [GET] /get-all-paing-statiscal
    async GetAllPairingStatiscal(req, res, next) {
        try {
            const pairing = await adminModel.GetPairingsStatiscal();

            if (pairing.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy cặp' });
            }

            return res.status(200).json(pairing);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-team-combox
    async GetTeamCb(req, res, next) {
        try {
            const teams = await adminModel.GetTeamCurrent();

            if (teams.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy team' });
            }

            return res.status(200).json(teams);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-paing-statiscal-date
    async GetAllPairingStatiscalDate(req, res, next) {
        try {
            if (!req.headers.date_start || !req.headers.date_end) {
                return res.status(404).json({ msg: 'not found' });
            }
            const pairing = await adminModel.GetPairingsStatiscalDate(req.headers.date_start, req.headers.date_end);

            if (pairing.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy cặp' });
            }

            return res.status(200).json(pairing);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [POST] /create-new-pairing
    async AddNewPairing(req, res, next) {
        let Pairing = req.body;
        const date = new Date();
        Pairing.dateRegister = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
        Pairing.dateOk = Pairing.dateRegister;
        Pairing.personalOpinion = true;

        try {
            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(Pairing.lecturersId);

            if (!lecturers) {
                return res.status(400).json({ msg: 'Ghép cặp không thành công' });
            }
            const count = await PairingModel.validateIsRegisted(Pairing);

            if (count.length >= 2) {
                return res.status(400).json({ msg: 'Số lượng giảng viên hướng dẫn đã tối đa' });
            }

            const isRegisted = await PairingModel.GetPairing(Pairing);
            if (isRegisted) {
                return res.status(400).json({ msg: 'Nhóm đã đăng ký giảng viên này rồi' });
            }

            await PairingModel.AddNewPairing2(Pairing);
            await lecturersModel.UpdateCountLecturersRegisterd(Pairing.lecturersId, lecturers.count - 1);
            return res.status(200).json({ msg: 'Đăng ký thành công.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Đăng ký không thành công' });
        }
    }

    // [PUT] /update-pairing
    async UpdatePairing(req, res, next) {
        let Pairing = req.body;
        const date = new Date();
        Pairing.dateRegister = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
        Pairing.dateOk = Pairing.dateRegister;
        Pairing.personalOpinion = false;

        try {
            const isUpdate = await adminModel.GetPairing(req.headers.id);
            if (!isUpdate) {
                return req.status(404).json({ msg: 'Không tìm thấy cặp' });
            }

            const isSuccess = await adminModel.UpdatePairing(req.headers.id, Pairing);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Cập nhật không thành công' });
        }
    }
    //[DELETE] /delete-paring'
    async DeletePairing(req, res, next) {
        const pairing = req.body;

        try {
            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(pairing.lecturersId);

            if (!lecturers) {
                return res.status(400).json({ msg: 'Ghép cặp không thành công' });
            }

            await PairingModel.DeletePairing(pairing);
            await lecturersModel.UpdateCountLecturersRegisterd(pairing.lecturersId, lecturers.count + 1);
            return res.status(200).json({ msg: 'Xóa thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Xóa không thành công, vui lòng thử lại.' });
        }
    }
    // team
    // [GET] /get-all-team
    async GetAllTeam(req, res, next) {
        const team = await adminModel.GetTeam();

        if (team.length === 0) {
            return res.status(401).json({ msg: 'Không tìm thấy nhóm' });
        }

        return res.status(200).json(team);
    }
    // [GET] /get-all-lecturers
    async GetAllLecturers(req, res, next) {
        const lecturers = await adminModel.GetLecturers();
        if (lecturers.length === 0) {
            return res.status(204).json({ msg: 'Không tìm thấy giảng viên' });
        }

        return res.status(200).json(lecturers);
    }
    //registration
    // [GET] /get-all-registration
    async GetAllRegistration(req, res, next) {
        try {
            const registration = await adminModel.GetAllRegistration();
            if (registration.length <= 0) {
                return res.status(401).json({ msg: 'not found' });
            }
            return res.status(200).json(registration);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Không lấy được đợt đăng ký' });
        }
    }
    // [GET] /get-registration
    async GetRegistration(req, res, next) {
        try {
            if (!req.headers.id) {
                return res.status(401).json({ msg: 'Không tin thấy id' });
            }

            const registration = await adminModel.GetRegistration(req.headers.id);
            if (!registration) {
                return res.status(401).json({ msg: 'not found' });
            }

            return res.status(200).json(registration);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Không lấy được đợt đăng ký' });
        }
    }
    // [POST] /create-new-registration
    async AddNewRegistration(req, res, next) {
        try {
            if (!req.body.name || !req.body.dateStart || !req.body.dateEnd) {
                return res.status(401).json({ msg: 'Không đủ thông tin' });
            }

            const Registration = req.body;
            await adminModel.AddNewRegistration(Registration);
            return res.status(200).json({ msg: 'Thêm mới thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Thêm mới không thành công' });
        }
    }
    // [PUT] /update/registration
    async UpdateRegistration(req, res, next) {
        try {
            if (!req.body.name || !req.body.dateStart || !req.body.dateEnd || !req.headers.id) {
                return res.status(401).json({ msg: 'Không đủ thông tin' });
            }

            const isUpdate = await adminModel.GetRegistration(req.headers.id);
            if (!isUpdate) {
                return res.status(401).json({ msg: 'not found' });
            }

            const Registration = req.body;
            const isSuccess = await adminModel.UpdateRegistration(req.headers.id, Registration);

            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }

            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Cập nhật không thành công' });
        }
    }

    // [DELETE] /delete/registration
    async DeleteRegistration(req, res, next) {
        console.log(req.headers);
        try {
            if (!req.headers.id) {
                return res.status(401).json({ msg: 'Không tìm thấy id' });
            }

            const isSuccess = await adminModel.DeleteRegistration(req.headers.id);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Xóa không thành công' });
            }

            return res.status(200).json({ msg: 'xóa thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Xóa không thành công' });
        }
    }

    //stage
    // [GET] /get-all-stage
    async GetAllStage(req, res, next) {
        try {
            const stage = await adminModel.GetAllStage();
            if (stage.length <= 0) {
                return res.status(404).json({ msg: 'not found' });
            }
            return res.status(200).json(stage);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Không lấy được đợt đăng ký' });
        }
    }
    // [GET] /get-stage
    async GetStage(req, res, next) {
        try {
            if (!req.headers.id) {
                return res.status(401).json({ msg: 'Không tin thấy id' });
            }

            const Stage = await adminModel.GetStage(req.headers.id);
            if (!Stage) {
                return res.status(404).json({ msg: 'not found' });
            }

            return res.status(200).json(Stage);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Không lấy được đợt đăng ký' });
        }
    }
    // [GET] /get-stage-current
    async GetCurrentStages(req, res, next) {
        try {
            const Stage = await adminModel.GetCurrentStages();
            if (Stage.length === 0) {
                return res.status(404).json({ msg: 'not found' });
            }

            return res.status(200).json(Stage);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Không lấy được đợt đăng ký' });
        }
    }
    // [POST] /create-new-stage
    async AddNewStage(req, res, next) {
        try {
            if (!req.body.name || !req.body.dateStart || !req.body.dateEnd || !req.body.DKID) {
                return res.status(401).json({ msg: 'Không đủ thông tin' });
            }

            const Stage = req.body;
            await adminModel.AddNewStage(Stage);
            return res.status(200).json({ msg: 'Thêm mới thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Thêm mới không thành công' });
        }
    }
    // [PUT] /update/stage
    async UpdateStage(req, res, next) {
        try {
            if (!req.body.name || !req.body.dateStart || !req.body.dateEnd || !req.headers.id || !req.body.DKID) {
                return res.status(404).json({ msg: 'Không đủ thông tin' });
            }

            const isUpdate = await adminModel.GetStage(req.headers.id);
            if (!isUpdate) {
                return res.status(404).json({ msg: 'not found' });
            }

            const Stage = req.body;
            const isSuccess = await adminModel.UpdateStage(req.headers.id, Stage);

            if (isSuccess.changedRows === 0) {
                console.log(isSuccess);
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }

            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Cập nhật không thành công' });
        }
    }

    // [DELETE] /delete/stage
    async DeleteStage(req, res, next) {
        try {
            if (!req.headers.id) {
                return res.status(401).json({ msg: 'Không tìm thấy id' });
            }

            const stage = await adminModel.DeleteStage(req.headers.id);
            if (stage.changedRows === 0) {
                return res.status(400).json({ msg: 'Xóa không thành công' });
            }

            return res.status(200).json({ msg: 'xóa thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Xóa không thành công' });
        }
    }
    // [GET] /get-all-team-stastiscal
    async GetAllTeamStatiscal(req, res, next) {
        try {
            const team = await adminModel.GetAllTeamStatiscal();

            if (team.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy nhóm' });
            }
            for (let i = 0; i < team.length; i++) {
                const researchQuestion = await ResearchQuestionModel.GetResearchQuestionByResearchFieldId(
                    team[i].MaLinhVucNghienCuu,
                );
                team[i].researchQuestion = researchQuestion;
            }

            return res.status(200).json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-team-stastiscal-date
    async GetAllTeamStatiscalDate(req, res, next) {
        try {
            if (!req.headers.date_start || !req.headers.date_end) {
                return res.status(404).json({ msg: 'not found' });
            }
            const team = await adminModel.GetAllTeamStatiscalDate(req.headers.date_start, req.headers.date_end);
            if (team.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy nhóm' });
            }
            for (let i = 0; i < team.length; i++) {
                const researchQuestion = await ResearchQuestionModel.GetResearchQuestionByResearchFieldId(
                    team[i].MaLinhVucNghienCuu,
                );
                team[i].researchQuestion = researchQuestion;
            }
            return res.status(200).json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-lecturers-stastiscal
    async GetAllLecturersStatiscal(req, res, next) {
        try {
            const lectueres = await adminModel.GetAllLecturersStatiscal();

            if (lectueres.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy giảng viên' });
            }

            return res.status(200).json(lectueres);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-lecturers-stastiscal-date
    async GetAllLecturersStatiscalDate(req, res, next) {
        try {
            if (!req.headers.date_start || !req.headers.date_end) {
                return res.status(404).json({ msg: 'not found' });
            }
            const lectueres = await adminModel.GetAllLecturersStatiscalDate(
                req.headers.date_start,
                req.headers.date_end,
            );

            if (lectueres.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy giảng viên' });
            }

            return res.status(200).json(lectueres);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-report
    async GetReports(req, res, next) {
        try {
            const Report = await adminModel.GetReports();

            if (Report.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy báo cáo' });
            }

            return res.status(200).json(Report);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get/report

    async GetReport(req, res, next) {
        try {
            if (!req.headers.stageid) {
                return res.status(404).json({ msg: 'not found' });
            }

            let Report = {};

            if (req.headers.teamid) {
                Report = await adminModel.GetReport(req.headers.stageid, req.headers.teamid);
            } else {
                Report = await adminModel.GetReportByStageId(req.headers.stageid);
            }

            if (!Report) {
                return res.status(204).json({ msg: 'Không tìm thấy báo cáo' });
            }

            return res.status(200).json(Report);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-report-statiscal
    async GetReportStatiscal(req, res, next) {
        try {
            const lecturersIds = await adminModel.GetLecturersIdStatiscal();
            if (lecturersIds.length === 0) {
                return res.status(404).json({ msg: 'not found' });
            }

            let arr = [];
            for (let i = 0; i < lecturersIds.length; i++) {
                let row = {};
                const reports = await adminModel.GetReportByLecturersId(lecturersIds[i].MaGiangVienDk);
                if (reports.length === 0) {
                    return res.status(404).json({ msg: 'not found' });
                }
                row.lecturersName = reports[0].HoTen;
                row.researchTopicName = reports[0].TenDeTaiNghienCuu;

                for (let i = 0; i < reports.length; i++) {
                    if (reports[i].isFiling) {
                        row[`reportRate${i}`] = reports[i].RatingRate;
                    } else {
                        row[`reportRate${i}`] = 'Chưa có';
                    }
                }

                arr.push(row);
            }
            // if (!req.headers.date_start || !req.headers.date_end) {
            //     return res.status(404).json({ msg: 'not found' });
            // }
            ///const pairing = await adminModel.GetPairingsStatiscalDate(req.headers.date_start, req.headers.date_end);

            // if (pairing.length === 0) {
            //     return res.status(204).json({ msg: 'Không tìm thấy cặp' });
            // }

            return res.status(200).json(arr);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET] /get-all-report-statiscal-date
    async GetReportStatiscalDate(req, res, next) {
        try {
            if (!req.headers.date_start || !req.headers.date_end) {
                return res.status(404).json({ msg: 'not found' });
            }
            const lecturersIds = await adminModel.GetLecturersIdStatiscalDate(
                req.headers.date_start,
                req.headers.date_end,
            );
            if (lecturersIds.length === 0) {
                return res.status(204).json({ msg: 'not found' });
            }

            let arr = [];
            for (let i = 0; i < lecturersIds.length; i++) {
                let row = {};
                const reports = await adminModel.GetReportByLecturersIdDate(
                    lecturersIds[i].MaGiangVienDk,
                    req.headers.date_start,
                    req.headers.date_end,
                );
                if (reports.length === 0) {
                    return res.status(404).json({ msg: 'not found' });
                }
                row.lecturersName = reports[0].HoTen;
                row.researchTopicName = reports[0].TenDeTaiNghienCuu;

                for (let i = 0; i < reports.length; i++) {
                    if (reports[i].isFiling) {
                        row[`reportRate${i}`] = reports[i].RatingRate;
                    } else {
                        row[`reportRate${i}`] = 'Chưa có';
                    }
                }

                arr.push(row);
            }
            // if (!req.headers.date_start || !req.headers.date_end) {
            //     return res.status(404).json({ msg: 'not found' });
            // }
            ///const pairing = await adminModel.GetPairingsStatiscalDate(req.headers.date_start, req.headers.date_end);

            // if (pairing.length === 0) {
            //     return res.status(204).json({ msg: 'Không tìm thấy cặp' });
            // }

            return res.status(200).json(arr);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [Update] /update/report
    async UpdateReport(req, res, next) {
        try {
            if (!req.body.stageId) {
                return res.status(404).json({ msg: 'not found' });
            }

            let kq = 0;
            if (req.body.teamId) {
                const lectueres = await lecturersModel.GetLecturersByTeamId(req.body.teamId);
                if (!lectueres) {
                    return res.status(400).json({ msg: 'Cập nhật không thành công' });
                }

                for (let i = 0; i < lectueres.length; i++) {
                    const isSuccess = await adminModel.UpdateReport({
                        ...req.body,
                        lecturersId: lectueres[i].MaGiangVienDk,
                    });
                    if (isSuccess.changedRows > 0) {
                        kq += 1;
                    }
                }
            } else {
                const isSuccess = await adminModel.UpdateReportByStageId(req.body);
                if (isSuccess.changedRows > 0) {
                    kq += 1;
                }
            }

            if (kq === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [DELETE] /delete/report
    async DeleteReport(req, res, next) {
        try {
            if (!req.body.stageId) {
                return res.status(404).json({ msg: 'not found' });
            }

            let kq = 0;
            if (req.body.teamId) {
                const isSuccess = await adminModel.DeleteReport(req.body);
                if (isSuccess.affectedRows > 0) {
                    kq++;
                }
            } else {
                const isSuccess = await adminModel.DeleteReportByStageId(req.body);

                if (isSuccess.affectedRows > 0) {
                    kq++;
                }
            }

            if (kq === 0) {
                return res.status(400).json({ msg: 'Xóa không thành công' });
            }
            return res.status(200).json({ msg: 'Xóa thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
}
module.exports = new AdminController();
