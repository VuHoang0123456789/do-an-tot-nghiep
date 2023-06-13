const { FormatDateNoHour } = require('../../auth/methods');
const PairingModel = require('../model/PairingModel');
const accountModel = require('../model/accountModel');
const adminModel = require('../model/adminModel');
const lecturersModel = require('../model/lecturersModel');
const LecturerstModel = require('../model/lecturersModel');
const rearchQuestionModel = require('../model/rearchQuestionModel');
const ReportModel = require('../model/reportModel');
const studentModel = require('../model/studentModel');
const teamModel = require('../model/teamModel');
const sgMail = require('@sendgrid/mail');

class LecturersController {
    //GET /get-all-lecturers/pairing-2
    async GetAllLecturersRegistedLast(req, res, next) {
        const results = await LecturerstModel.GetAllLecturersLast();
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
    //GET /get-all-lecturers/pairing-1
    async GetAllLecturersRegistedFirt(req, res, next) {
        try {
            const results = await LecturerstModel.GetAllLecturersFirt();
            const lecturers = [];
            results.forEach((result) => {
                lecturers.push({
                    lecturersId: result.MaGiangVien,
                    name: result.HoTen,
                    birthDay: result.NgaySinh,
                    AcademicLevel: result.TenHocHamHocVi,
                    lenguageIntruduce: result.TenNgonNguHuongDan,
                    specialized: result.TenChuyenNganhHuongDan,
                    image_url: result.FileAnhUrl,
                    background_url: result.FileLyLichUrl,
                    lecturersRegistedId: result.MaGiangVienDk,
                    count: result.count,
                });
            });
            if (res.status === 204) {
                return res.status(204).json({ msg: 'not found' });
            }
            return res.status(200).json(lecturers);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //GET /get-infomation-lecturers
    async GetInfomationLectures(req, res, next) {
        try {
            const lecturersAccount = await accountModel.GetEmailByLecturersId(undefined, req.user.Email);
            const lecturersId = lecturersAccount.MaGiangVien;
            const lecturersInfomation = await LecturerstModel.GetLecturersByLecturersId(lecturersId);
            const teamInfomation = await teamModel.GetTeamByLecturersId(
                lecturersInfomation.MaGiangVienDk,
                parseInt(req.headers.stageid),
            );
            for (let i = 0; i < teamInfomation.length; i++) {
                let rearchQuestion = await rearchQuestionModel.GetResearchQuestionByResearchFieldId(
                    teamInfomation[i].MaLinhVucNghienCuu,
                );
                teamInfomation[i].rearchQuestions = rearchQuestion;
            }

            const result = {
                lecturersInfomation: lecturersInfomation,
                teamInfomation,
            };
            if (!result) {
                return res.status(204).json({ msg: 'không tìm thấy giảng viên' });
            }
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //GET /get-infro-lecturers-pesonal
    async GetInfomationLecturesPesonal(req, res, next) {
        try {
            const lecturersAccount = await accountModel.GetEmailByLecturersId(undefined, req.user.Email);
            const lecturersId = lecturersAccount.MaGiangVien;
            const lecturersInfomation = await LecturerstModel.GetLecturersByLecturersId(lecturersId);
            const teamInfomation = await teamModel.GetTeamByLecturersIdAndOpinion(
                lecturersInfomation.MaGiangVienDk,
                parseInt(req.headers.stageid),
            );

            for (let i = 0; i < teamInfomation.length; i++) {
                let rearchQuestion = await rearchQuestionModel.GetResearchQuestionByResearchFieldId(
                    teamInfomation[i].MaLinhVucNghienCuu,
                );
                teamInfomation[i].rearchQuestions = rearchQuestion;
            }

            const result = {
                lecturersInfomation: lecturersInfomation,
                teamInfomation,
            };
            if (!result) {
                return res.status(204).json({ msg: 'không tìm thấy giảng viên' });
            }
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //GET /get-all-team
    async GetAllTeam(req, res, next) {
        try {
            const lecturersAccount = await accountModel.GetEmailByLecturersId(undefined, req.user.Email);
            const lecturersId = lecturersAccount.MaGiangVien;
            const lecturersInfomation = await LecturerstModel.GetLecturersByLecturersId(lecturersId);
            const teamInfomation = await teamModel.GetTeamByLecturersIdAndOpinion(lecturersInfomation.MaGiangVienDk);

            if (!teamInfomation) {
                return res.status(204).json({ msg: 'no content' });
            }
            return res.status(200).json(teamInfomation);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //GET /get-lecturers
    async GetLecturers(req, res, next) {
        try {
            const lecturers = await LecturerstModel.GetLecturersByEmail(req.user.Email);
            if (!lecturers) {
                return res.status(401).json({ msg: 'Không tìm thấy giảng viên.' });
            }

            return res.status(200).json(lecturers);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ msg: 'Không tìm thấy giảng viên.' });
        }
    }
    //GET /get-lecturers-platfrom
    async GetLecturersPlatform(req, res, next) {
        try {
            const lecturers = await LecturerstModel.GetLecturersByEmailPlatfrom(req.user.Email);
            if (!lecturers) {
                return res.status(204).json({ msg: 'Không tìm thấy giảng viên.' });
            }
            const CheckLectueresRegisted = await LecturerstModel.GetLecturersToAllStage(lecturers.MaGiangVien);
            if (CheckLectueresRegisted) {
                lecturers.TenNgonNguHuongDan = CheckLectueresRegisted.TenChuyenNganhHuongDan;
                lecturers.TenChuyenNganhHuongDan = CheckLectueresRegisted.TenChuyenNganhHuongDan;
                lecturers.count = CheckLectueresRegisted.count > 0 ? CheckLectueresRegisted.count : undefined;
                lecturers.FileAnhUrl = CheckLectueresRegisted.FileAnhUrl;
                lecturers.FileLyLichUrl = CheckLectueresRegisted.FileLyLichUrl;
            }
            return res.status(200).json(lecturers);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //GET /get-lecturers-registed
    async GetLecturersRegisted(req, res, next) {
        try {
            const lecturers = await LecturerstModel.GetLecturersByEmail(req.user.Email);
            return res.status(200).json(lecturers);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ msg: 'Không tìm thấy giảng viên.' });
        }
    }
    //GET /get-all-report
    async GetAllReport(req, res, next) {
        if (!req.headers.lecturersid) {
            return res.status(404).json({ msg: 'Không đủ thông tin' });
        }

        const report = {
            lecturersId: req.headers.lecturersid,
            Id: req.headers.stageid,
        };

        const Reports = await ReportModel.GetAllReportOfLecturers(report);
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
                reportId: report.ReportId,
                title: report.TieuDe,
                deadline: [
                    deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate(),
                    deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1,
                    deadline.getFullYear(),
                ].join('-'),
                createAt: [
                    createAt.getDate() < 10 ? '0' + createAt.getDate() : createAt.getDate(),
                    createAt.getMonth() + 1 < 10 ? '0' + (createAt.getMonth() + 1) : createAt.getMonth() + 1,
                    createAt.getFullYear(),
                ].join('-'),
                dateOfFliling: [
                    deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate(),
                    deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1,
                    dateOfFliling.getFullYear(),
                ].join('-'),
                note: report.Note,
                lecturersId: report.MaGiangVienDk,
                teamId: report.MaNhom,
                teamName: report.TenNhom,
                stageId: report.Id,
                isFiling: report.isFiling,
            };
            ReportOfRes.push(reportOfRes);
        });

        res.status(200).json(ReportOfRes);
    }
    // GET /get-report
    async GetReport(req, res, next) {
        try {
            if (!req.headers.reportid) {
                return res.status(400).json({ msg: 'Không đủ thông tin' });
            }

            const report = await ReportModel.GetReportByReportId(req.headers.reportid);

            if (report.length === 0) {
                return res.status(400).json({ msg: 'Không tim thấy report' });
            }

            const team = await teamModel.GetTeamByTeamId(report.MaNhom);

            let createAt = report.NgayBatDau;
            let deadline = report.HanNopBaoCao;
            let dateOfFliling = report.NgayNopBaoCao;

            const reportOfRes = {
                reportId: report.ReportId,
                title: report.TieuDe,
                deadline: [
                    deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate(),
                    deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1,
                    deadline.getFullYear(),
                ].join('-'),
                createAt: [
                    createAt.getDate() < 10 ? '0' + createAt.getDate() : createAt.getDate(),
                    createAt.getMonth() + 1 < 10 ? '0' + (createAt.getMonth() + 1) : createAt.getMonth() + 1,
                    createAt.getFullYear(),
                ].join('-'),
                dateOfFliling: [
                    dateOfFliling.getDate() < 10 ? '0' + dateOfFliling.getDate() : dateOfFliling.getDate(),
                    dateOfFliling.getMonth() + 1 < 10
                        ? '0' + (dateOfFliling.getMonth() + 1)
                        : dateOfFliling.getMonth() + 1,
                    dateOfFliling.getFullYear(),
                ].join('-'),
                note: report.Note,
                lecturersId: report.MaGiangVienDk,
                teamId: report.MaNhom,
                stageId: report.Id,
                isFiling: report.isFiling,
                teamName: team.TenNhom,
                fileReport: report.FileBaoCao,
                rate: report.RatingRate,
            };
            return res.status(200).json(reportOfRes);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // POST /register-platform
    async RegisterPlatfrom(req, res, next) {
        try {
            const date = new Date();
            let Lecturers = {
                lecturersRegistedId: req.body.lecturersRegistedId,
                language: req.body.language,
                specialized: req.body.specialized,
                count: req.body.count,
            };
            let RegisterLecturers = {
                stageId: parseInt(req.body.stageId),
                lecturersId: req.body.lecturersId,
                lecturersRegistedId: req.body.lecturersRegistedId,
                registerDate: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
            };

            const isSuccess = await LecturerstModel.AddNewLecturersOfLecturersRegisted(Lecturers);
            const isSuccess1 = await LecturerstModel.AddRegisterIsLecturersRegisted(RegisterLecturers);
            if (isSuccess.changedRows === 0 && isSuccess1.changedRows === 0) {
                return res.status(400).json({ msg: 'Đăng ký platform không thành công, vui lòng kiểm tra lại' });
            }
            return res.status(201).json({ msg: 'Đăng ký platform thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // POST /:slug/upload-file
    async UpLoadFile(req, res, next) {
        if (!req.files) {
            next(new Error('No file uploaded!'));
            return;
        }

        try {
            let LecturersRegisted = {
                LecturersId: '',
                image_url: req.files[0].path,
                background_url: req.files[1].path,
                language: '',
                specialized: '',
                count: 1,
            };
            LecturersRegisted.LecturersId = `GVDK${Math.floor(100000 + Math.random() * 900000)}`;

            const isSuccess = await LecturerstModel.AddFileOfLecturersRegisted(LecturersRegisted);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Đăng ký platform không thành công, vui lòng kiểm tra lại' });
            }
            return res.status(201).json({
                LecturersId: LecturersRegisted.LecturersId,
                image_url: LecturersRegisted.image_url,
                background_url: LecturersRegisted.background_url,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // POST /:slug/create-new-reports
    async AddNewReports(req, res, next) {
        try {
            const createAt = new Date(req.body.dateStart);
            const deadline = new Date(req.body.dateEnd);
            const dateOfFliling = new Date(req.body.dateFiling);
            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);
            const parings = await adminModel.GetAllPairing();
            let kq = [];

            const report = {
                title: req.body.title,
                deadline: [
                    deadline.getFullYear(),
                    deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1,
                    deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate(),
                ].join('-'),
                createAt: [
                    createAt.getFullYear(),
                    createAt.getMonth() + 1 < 10 ? '0' + (createAt.getMonth() + 1) : createAt.getMonth() + 1,
                    createAt.getDate() < 10 ? '0' + createAt.getDate() : createAt.getDate(),
                ].join('-'),
                dateOfFliling: [
                    dateOfFliling.getFullYear(),
                    dateOfFliling.getMonth() + 1 < 10
                        ? '0' + (dateOfFliling.getMonth() + 1)
                        : dateOfFliling.getMonth() + 1,
                    dateOfFliling.getDate() < 10 ? '0' + dateOfFliling.getDate() : dateOfFliling.getDate(),
                ].join('-'),
                note: !req.body.note ? '' : req.body.note,
                stageId: req.body.stageId,
                isFiling: false,
            };

            const validate = await ReportModel.GetReportByStageId(report.stageId);
            if (validate) {
                return res
                    .status(400)
                    .json({ msg: 'Đã gửi thông báo tới các nhóm và giảng viên rồi, vui lòng kiểm tra lại.' });
            }

            for (let i = 0; i < parings.length; i++) {
                const reportId = `RP${10000000 + Math.floor(Math.random() * 90000000)}`;

                try {
                    await ReportModel.AddNewReport({
                        ...report,
                        lecturersId: parings[i].MaGiangVienDk,
                        teamId: parings[i].MaNhom,
                        reportId: reportId,
                    });
                    kq.push(i);
                } catch (error) {
                    console.log(error);
                    break;
                }

                // Gửi thông báo
                // sinh viên
                let subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
                let content = `Ban quản lý gửi đến sinh viên ${parings[i].leaderName} nhóm trưởng nhóm ${parings[i].TenNhom} thông tin của ${report.title}: <br/>
                Tiêu đề: ${report.title}<br/>
                Nội dung: ${report.note}<br/>
                Hạn nộp báo cáo: ${report.deadline}<br/>
                Ngày tạo: ${report.createAt}`;

                let msg = {
                    to: parings[i].studentEmail,
                    from: adminEmailAddress,
                    subject: subject,
                    text: content,
                    html: `<strong>${content}</strong>`,
                };

                sgMail
                    .send(msg)
                    .then(() => {
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                        return;
                    });
                // giảng viên
                subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
                content = `Ban quản lý gửi đến giảng viên ${parings[i].TenGiangVien} thông tin của ${report.title}: <br/>
                Tiêu đề: ${report.title}<br/>
                Nội dung: ${report.note}<br/>
                Hạn nộp báo cáo: ${report.deadline}<br/>
                Ngày tạo: ${report.createAt}`;

                msg = {
                    to: parings[i].lecturersEmail,
                    from: adminEmailAddress,
                    subject: subject,
                    text: content,
                    html: `<strong>${content}</strong>`,
                };
                sgMail
                    .send(msg)
                    .then(() => {
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                        return;
                    });
            }

            if (kq.length === 0) {
                return res.status(400).json({ msg: 'Tạo mới thông báo khong thành công' });
            }
            return res.status(201).json({ msg: 'Tạo mới thông báo thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }

    async AddNewReport(req, res, next) {
        const createAt = new Date(req.body.dateStart);
        const deadline = new Date(req.body.dateEnd);
        const dateOfFliling = new Date(req.body.dateFiling);

        try {
            const lecturers = await lecturersModel.GetLecturersByTeamId(req.body.teamId);
            const report = {
                title: req.body.title,
                deadline: [
                    deadline.getFullYear(),
                    deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1,
                    deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate(),
                ].join('-'),
                createAt: [
                    createAt.getFullYear(),
                    createAt.getMonth() + 1 < 10 ? '0' + (createAt.getMonth() + 1) : createAt.getMonth() + 1,
                    createAt.getDate() < 10 ? '0' + createAt.getDate() : createAt.getDate(),
                ].join('-'),
                dateOfFliling: [
                    dateOfFliling.getFullYear(),
                    dateOfFliling.getMonth() + 1 < 10
                        ? '0' + (dateOfFliling.getMonth() + 1)
                        : dateOfFliling.getMonth() + 1,
                    dateOfFliling.getDate() < 10 ? '0' + dateOfFliling.getDate() : dateOfFliling.getDate(),
                ].join('-'),
                note: !req.body.note ? '' : req.body.note,
                teamId: req.body.teamId,
                stageId: req.body.stageId,
                isFiling: false,
            };

            let lecturersEmail = [];
            for (let i = 0; i < lecturers.length; i++) {
                const reportId = `RP${10000000 + Math.floor(Math.random() * 90000000)}`;

                report.reportId = reportId;
                report.lecturersId = lecturers[i].MaGiangVienDk;

                try {
                    await ReportModel.AddNewReport(report);
                    lecturersEmail.push((await lecturersModel.GetEmailOfLecturers(lecturers[i].MaGiangVienDk)).Email);
                } catch (error) {}
            }

            if (lecturersEmail.length === 0) {
                return res.status(400).json({ msg: 'Tạo mới báo cáo không thành công' });
            }
            res.status(201).json({ msg: 'Tạo mới báo cáo thành công' });

            // gửi thông báo
            const teamEmail = await studentModel.GetEmailOfTeam(req.body.teamId);
            if (!teamEmail) {
                return;
            }

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư

            sgMail.setApiKey(sengridApiKey);

            let subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            let content = `Ban quản lý gửi đến sinh viên ${teamEmail.HoTen} nhóm trưởng nhóm ${teamEmail.TenNhom} thông tin của ${report.title}: <br/>
                Tiêu đề: ${report.title}<br/>
                Nội dung: ${report.note}<br/>
                Hạn nộp báo cáo: ${report.deadline}<br/>
                Ngày tạo: ${report.createAt}`;

            let msg = {
                to: teamEmail.Email,
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };

            sgMail
                .send(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });

            subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            content = `Ban quản lý gửi đến giảng viên hướng dẫn thông tin của ${report.title}: <br/>
                Tiêu đề: ${report.title}<br/>
                Nội dung: ${report.note}<br/>
                Hạn nộp báo cáo: ${report.deadline}<br/>
                Ngày tạo: ${report.createAt}`;

            msg = {
                to: [lecturersEmail],
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };

            sgMail
                .sendMultiple(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //PUT/:slug/update-file
    async UpdateFile(req, res, next) {
        try {
            if (!req.file) {
                return res.status(401).json({ msg: 'Không tìm thấy file cần upload' });
            }

            const LecturersRegisteredId = req.headers.lecturersid;
            const LecturersRegistedFromDatabase = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(
                LecturersRegisteredId,
            );

            let LecturersRegisted = {
                lecturersRegistedId: LecturersRegistedFromDatabase.MaGiangVienDk,
                url_imge: LecturersRegistedFromDatabase.FileAnhUrl,
                url_background: LecturersRegistedFromDatabase.FileLyLichUrl,
                language: LecturersRegistedFromDatabase.TenNgonNguHuongDan,
                specialized: LecturersRegistedFromDatabase.TenChuyenNganhHuongDan,
                count: LecturersRegistedFromDatabase.count,
            };

            if (req.headers.url_imge) {
                LecturersRegisted.url_imge = !req.file ? LecturersRegistedFromDatabase.FileAnhUrl : req.file.path;
            }

            if (req.headers.url_background) {
                LecturersRegisted.url_background = !req.file
                    ? LecturersRegistedFromDatabase.FileLyLichUrl
                    : req.file.path;
            }

            const isSuccess = await LecturerstModel.UpdateLecturersRegisterd(LecturersRegisted);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng thử lại.' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //PUT/update-lecturers
    async UpdateLecturers(req, res, next) {
        try {
            const LecturersRegisteredId = req.headers.lecturersid;
            const LecturersRegistedFromDatabase = await LecturerstModel.GetLecturersRegistedByLecturersRegistedId(
                LecturersRegisteredId,
            );

            if (!LecturersRegistedFromDatabase) {
                return res.status(400).json({ msg: 'Mã giảng viên đăng ký không đúng, vui lòng kiểm tra lại.' });
            }

            let LecturersRegisted = {
                lecturersRegistedId: LecturersRegistedFromDatabase.MaGiangVienDk,
                url_imge: LecturersRegistedFromDatabase.FileAnhUrl,
                url_background: LecturersRegistedFromDatabase.FileLyLichUrl,
                language: LecturersRegistedFromDatabase.TenNgonNguHuongDan,
                specialized: LecturersRegistedFromDatabase.TenChuyenNganhHuongDan,
                count: LecturersRegistedFromDatabase.count,
            };
            LecturersRegisted.language = !req.body.language
                ? LecturersRegistedFromDatabase.TenNgonNguHuongDan
                : req.body.language;
            LecturersRegisted.specialized = !req.body.specialized
                ? LecturersRegistedFromDatabase.TenChuyenNganhHuongDan
                : req.body.specialized;
            LecturersRegisted.count = !req.body.count ? LecturersRegistedFromDatabase.count : req.body.count;
            // Cập nhật lecturersRegisted
            const isSuccess = await LecturerstModel.UpdateLecturersRegisterd(LecturersRegisted);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng thử lại.' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //put /update-pairing
    async UpdatePairing(req, res, next) {
        const Pairing = req.body;
        const date = new Date();
        Pairing.dateOk = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
        Pairing.personalOpinion = true;

        try {
            const isSuccess = await PairingModel.UpdatePairing(Pairing);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng kiểm tra lại thông tin.' });
            }
            res.status(200).json({ msg: 'Cập nhật thành công.' });

            // gửi thông báo
            const email = (await studentModel.GetStudentByTeamId(req.body.teamId)).Email;
            if (!email) {
                return;
            }
            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(req.body.lecturersId);
            if (!lecturers) {
                return;
            }
            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `Giảng viên ${lecturers.HoTen} đã đồng ý làm giảng viên hướng dẫn của nhóm`;

            const msg = {
                to: email,
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //put /update-report
    async UpdateReport(req, res, next) {
        try {
            const Report = req.body;
            Report.reportId = req.headers.reportid;

            const isSuccess = await ReportModel.UpdateReportOfLectuers(Report);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng kiểm tra lại thông tin.' });
            }
            const newReport = await ReportModel.GetReportByReportId(req.headers.reportid);

            res.status(200).json({ msg: 'Cập nhật thành công.' });
            console.log(newReport);
            // gửi thông báo
            // const email = (await studentModel.GetStudentByTeamId(Report.teamId)).Email;
            // if (!email) {
            //     return;
            // }

            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(Report.lecturersId);
            if (!lecturers) {
                return;
            }

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `
            Giảng viên ${lecturers.HoTen} đã đánh giá báo cáo nhóm của đạt ${newReport.RatingRate}: <br/>
            Tiêu đề: ${newReport.TieuDe}<br/>
            Nội dung: ${newReport.Note}<br/>
            Ngày tạo: ${await FormatDateNoHour(newReport.NgayBatDau)}<br/>
            Hạn nộp báo cáo: ${await FormatDateNoHour(newReport.HanNopBaoCao)}`;

            const msg = {
                to: 'vuhuyhoang1206@gmail.com',
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //put /delete-report
    async DeleteReport(req, res, next) {
        try {
            const report = await ReportModel.GetReportByReportId(req.headers.reportid);
            if (!report) {
                return res.status(400).json({ msg: 'Không tìm thấy report' });
            }

            const isSuccess = await ReportModel.DeleteReport(req.headers.reportid);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'xóa không thành công, vui lòng kiểm tra lại thông tin.' });
            }
            res.status(200).json({ msg: 'Xóa thành thành công báo cáo.' });

            // gửi thông báo
            const email = (await studentModel.GetStudentByTeamId(report.MaNhom)).Email;
            if (!email) {
                return;
            }
            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(report.MaGiangVienDk);
            if (!lecturers) {
                return;
            }

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `
                Giảng viên ${lecturers.HoTen} xóa bài tập đã giao cho nhóm của bạn: <br/>
                Tiêu đề: ${report.TieuDe}<br/>
                Nội dung: ${report.Note}<br/>
                Hạn nộp báo cáo: ${FormatDateNoHour(report.HanNopBaoCao)}<br/>
                Ngày tạo: ${FormatDateNoHour(report.NgayBatDau)}`;

            const msg = {
                to: email,
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [delete] /delete/pairing
    async DeletePairing(req, res, next) {
        const pairing = req.body;

        try {
            const isSuccess = await PairingModel.DeletePairing(pairing);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Xóa không thành công' });
            }
            res.status(200).json({ msg: 'Xóa thành công' });

            // gửi thông báo
            const email = (await studentModel.GetStudentByTeamId(req.body.teamId)).Email;
            if (!email) {
                return;
            }
            const lecturers = await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(req.body.lecturersId);
            if (!lecturers) {
                return;
            }

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `Giảng viên ${lecturers.HoTen} không đồng ý hướng dẫn nhóm, 
            vui lòng truy cập vào website để đăng ký giảng viên khác làm giảng viên hướng dẫn.`;

            const msg = {
                to: email,
                from: adminEmailAddress,
                subject: subject,
                text: content,
                html: `<strong>${content}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => {
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
}
module.exports = new LecturersController();
