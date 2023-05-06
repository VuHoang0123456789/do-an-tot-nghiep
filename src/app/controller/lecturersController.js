const PairingModel = require('../model/PairingModel');
const accountModel = require('../model/accountModel');
const LecturerstModel = require('../model/lecturersModel');
const ReportModel = require('../model/reportModel');
const teamModel = require('../model/teamModel');

class LecturersController {
    // POST /:slug/register-platform
    async RegisterPlatfrom(req, res, next) {
        const LecturersRegistered = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(
            req.body.lecturersRegistedId,
        );
        if (!LecturersRegistered) {
            return res.status(401).send('Đăng ký không thành công, vui lòng thử lại.');
        }

        try {
            const date = new Date();
            let Lecturers = {
                lecturersRegistedId: req.body.lecturersRegistedId,
                language: req.body.language,
                specialized: req.body.specialized,
            };
            let RegisterLecturers = {
                stageId: req.body.stageId,
                lecturersId: req.body.lecturersId,
                lecturersRegistedId: req.body.lecturersRegistedId,
                registerDate: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
            };

            await LecturerstModel.AddNewLecturersOfLecturersRegisted(Lecturers);
            await LecturerstModel.AddRegisterIsLecturersRegisted(RegisterLecturers);
        } catch (error) {
            console.log(error);
            return res.status(400).send('Đăng ký platform không thành công, vui lòng kiểm tra lại');
        }
        return res.status(200).send('Đăng ký platform thành công');
    }
    // POST /:slug/upload-file
    async UpLoadFile(req, res, next) {
        if (!req.files) {
            next(new Error('No file uploaded!'));
            return;
        }
        let LecturersRegisted = {
            LecturersId: '',
            image_url: req.files[0].path,
            background_url: req.files[1].path,
            language: '',
            specialized: '',
        };

        LecturersRegisted.LecturersId = `GVDK'${Math.floor(100000 + Math.random() * 900000)}'`;
        try {
            await LecturerstModel.AddFileOfLecturersRegisted(LecturersRegisted);
        } catch (error) {
            console.log(error);
            return res.status(400).send('Đăng ký platformkhông thành công, vui lòng kiểm tra lại');
        }

        return res.status(200).json({
            LecturersId: LecturersRegisted.LecturersId,
            image_url: LecturersRegisted.image_url,
            background_url: LecturersRegisted.background_url,
        });
    }
    //GET /get-all-lecturers
    async GetAllLecturersRegisted(req, res, next) {
        const results = await LecturerstModel.GetAllLecturers();
        const lecturers = [];
        results.forEach((result) => {
            lecturers.push({
                lecturersId: result.MaGiangVienDk,
                name: result.HoTen,
                birthDay: result.NgaySinh,
                AcademicLevel: result.TenHocHamHocVi,
                lenguageIntruduce: result.TenNgonNguHuongDan,
                specialized: result.TenChuyenNganhHuongDan,
                count: 4 - result.SoLuongNhomCoTheNhan,
            });
        });
        res.status(200).json(lecturers);
    }
    //GET /get-infomation-lecturers
    async GetInfomationLectures(req, res, next) {
        try {
            const lecturersAccount = await accountModel.GetEmailByLecturersId(undefined, req.user.Email);
            const lecturersId = lecturersAccount.MaGiangVien;
            const lecturersInfomation = await LecturerstModel.GetLecturersByLecturersId(lecturersId);
            const teamInfomation = await teamModel.GetTeamByLecturersId(
                lecturersInfomation.MaGiangVienDk,
                req.body.stageId,
            );
            const result = {
                lecturersInfomation: lecturersInfomation,
                teamInfomation: teamInfomation,
            };
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    }
    //GET /get-all-team
    async GetAllTeam(req, res, next) {
        try {
            const lecturersAccount = await accountModel.GetEmailByLecturersId(undefined, req.user.Email);
            const lecturersId = lecturersAccount.MaGiangVien;
            const lecturersInfomation = await LecturerstModel.GetLecturersByLecturersId(lecturersId);
            const teamInfomation = await teamModel.GetTeamByLecturersId(
                lecturersInfomation.MaGiangVienDk,
                req.body.stageId,
            );
            return res.status(200).json(teamInfomation);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    }
    // POST /:slug/create-new-report
    async AddNewReport(req, res, next) {
        const reportId = `RP${10000000 + Math.floor(Math.random() * 90000000)}`;
        const createAt = new Date();
        try {
            const report = {
                reportId: reportId,
                title: req.body.title,
                deadline: req.body.deadline,
                createAt: [createAt.getFullYear(), createAt.getMonth() + 1, createAt.getDate()].join('-'),
                dateOfFliling: [createAt.getFullYear(), createAt.getMonth() + 1, createAt.getDate()].join('-'),
                note: !req.body.note ? '' : req.body.note,
                lecturersId: req.body.lecturersId,
                teamId: req.body.teamId,
                stageId: req.body.stageId,
                isFiling: false,
            };
            await ReportModel.AddNewReport(report);
            return res.status(200).json({ reportId: report.reportId });
        } catch (error) {
            console.log(error);
            return res.status(401).send('Thông tin không đúng, vui lòng kiểm tra lại.');
        }
    }
    // GET  /:slug/get-all-report
    async GetAllReport(req, res, next) {
        const Reports = await ReportModel.GetAllReport();
        let ReportOfRes = [];

        if (Reports.length <= 0) {
            return res.status(200).json(ReportOfRes);
        }

        let createAt = '';
        let deadline = '';
        let dateOfFliling = '';
        Reports.forEach((report) => {
            createAt = report.NgayBatDau;
            deadline = report.HanNopBaoCao;
            dateOfFliling = report.NgayNopBaoCao;

            const reportOfRes = {
                reportId: report.reportId,
                title: report.TieuDe,
                deadline: [deadline.getFullYear(), deadline.getMonth() + 1, deadline.getDate()].join('-'),
                createAt: [createAt.getFullYear(), createAt.getMonth() + 1, createAt.getDate()].join('-'),
                dateOfFliling: [
                    dateOfFliling.getFullYear(),
                    dateOfFliling.getMonth() + 1,
                    dateOfFliling.getDate(),
                ].join('-'),
                note: report.Note,
                lecturersId: report.MaGiangVienDk,
                teamId: report.MaNhom,
                stageId: report.Id,
                isFiling: true,
            };
            ReportOfRes.push(reportOfRes);
        });

        res.status(200).json(ReportOfRes);
    }
    //PUT/:slug/update-file
    async UpdateFile(req, res, next) {
        if (!req.files) {
            return res.status(401).send('Không tìm thấy file cần upload');
        }

        const LecturersRegisteredId = req.headers.lecturersid;
        const LecturersRegistedFromDatabase = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(
            LecturersRegisteredId,
        );

        try {
            let LecturersRegisted = {
                lecturersRegistedId: LecturersRegistedFromDatabase.MaGiangVienDk,
                url_imge: LecturersRegistedFromDatabase.FileAnhUrl,
                url_background: LecturersRegistedFromDatabase.FileLyLichUrl,
                language: LecturersRegistedFromDatabase.TenNgonNguHuongDan,
                specialized: LecturersRegistedFromDatabase.TenChuyenNganhHuongDan,
            };

            LecturersRegisted.url_imge = !req.files[0] ? LecturersRegistedFromDatabase.FileAnhUrl : req.files[0].path;
            LecturersRegisted.url_background = !req.files[1]
                ? LecturersRegistedFromDatabase.FileLyLichUrl
                : req.files[1].path;

            await LecturerstModel.UpdateLecturersRegisterd(LecturersRegisted);
            return res.status(200).send('Cập nhật thành công.');
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng thử lại.');
        }
    }
    //PUT/:slug/update-lecturers
    async UpdateLecturers(req, res, next) {
        const LecturersRegisteredId = req.headers.lecturersid;
        const LecturersRegistedFromDatabase = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(
            LecturersRegisteredId,
        );
        if (!LecturersRegistedFromDatabase) {
            return res.status(401).send('Mã giảng viên đăng ký không đúng, vui lòng kiểm tra lại.');
        }

        try {
            let LecturersRegisted = {
                lecturersRegistedId: LecturersRegistedFromDatabase.MaGiangVienDk,
                url_imge: LecturersRegistedFromDatabase.FileAnhUrl,
                url_background: LecturersRegistedFromDatabase.FileLyLichUrl,
                language: LecturersRegistedFromDatabase.TenNgonNguHuongDan,
                specialized: LecturersRegistedFromDatabase.TenChuyenNganhHuongDan,
            };
            LecturersRegisted.language = !req.body.language
                ? LecturersRegistedFromDatabase.TenNgonNguHuongDan
                : req.body.language;
            LecturersRegisted.specialized = !req.body.specialized
                ? LecturersRegistedFromDatabase.TenChuyenNganhHuongDan
                : req.body.specialized;
            // Cập nhật lecturersRegisted
            await LecturerstModel.UpdateLecturersRegisterd(LecturersRegisted);
            return res.status(200).send('Cập nhật thành công.');
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng thử lại.');
        }
    }
    async DeletePairing(req, res, next) {
        const pairing = req.body;

        try {
            await PairingModel.DeletePairing(pairing);
            return res.status(200).send('Cập nhật thành công');
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng thử lại.');
        }
    }
}
module.exports = new LecturersController();
