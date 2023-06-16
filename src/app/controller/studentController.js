const ResearchFieldModel = require('../model/researchFieldModel');
const TeamModel = require('../model/teamModel');
const RegisterTeamModel = require('../model/registerTeamModel');
const ResearchQuestionModel = require('../model/rearchQuestionModel');
const studentModel = require('../model/studentModel');
const lecturersModel = require('../model/lecturersModel');
const teamModel = require('../model/teamModel');
const PairingModel = require('../model/PairingModel');
const reportModel = require('../model/reportModel');
const accountModel = require('../model/accountModel');
const sgMail = require('@sendgrid/mail');

class StudentController {
    // Đăng ký Platfrom cho sinh viên, sau khi upload file sẽ nhận về 2 mã nhóm và mã sinh viên
    // sau đó cập nhật thêm vào
    // post /student/register-platform/:slug
    async RegisterPlatfrom(req, res, next) {
        try {
            const date = new Date();
            let Team = {
                teamName: req.body.teamName,
                count: parseInt(req.body.count),
                teamId: req.body.teamId,
                url: '',
            };
            let RegisterTeam = {
                registerDate: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
                stageId: parseInt(req.body.stageId),
                teamId: req.body.teamId,
                studentId: req.body.studentId,
            };
            let ResearchField = {
                researchFieldId: req.body.researchFieldId,
                researchFieldName: req.body.researchFieldName,
                topicName: req.body.topicName,
            };
            let ResearchQuestion = req.body.questions;
            // Gán lại lý lịch url
            const teamfromFatabase = await teamModel.GetTeamByTeamId(req.body.teamId);
            Team.url = teamfromFatabase.LyLichThanhVien;

            await TeamModel.UpdateTeam(Team);
            await RegisterTeamModel.AddNewRegisterTeam(RegisterTeam);
            await ResearchFieldModel.UpdateResearchField(ResearchField);

            if (ResearchQuestion.length > 0) {
                for (let i = 0; i < ResearchQuestion.length; i++) {
                    const Question = await ResearchQuestionModel.GetResearchQuestion(
                        ResearchQuestion[i],
                        ResearchField.researchFieldId,
                    ); // lấy câu hỏi và kiểm tra xem nó đã có trong database chưa
                    if (!Question) {
                        await ResearchQuestionModel.AddNewResearchQuestion(
                            ResearchQuestion[i],
                            ResearchField.researchFieldId,
                        ); // thêm câu hỏi vào database
                    }
                }
            }
            return res.status(201).json({ msg: 'Đăng ký thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Đăng ký không thành công, vui lòng kiểm tra lại thông tin' });
        }
    }
    // upload file cho sinh viên và trả về Mã lĩnh vực nghiên cứu và Mã nhóm
    // post student/:slug/upload-file
    async UpLoadFile(req, res, next) {
        if (!req.file) {
            next(new Error('No file uploaded!'));
            return;
        }

        let ResearchField = {
            id: '',
            name: '',
            topicName: '',
        };
        let Team = {
            teamId: '',
            url: req.file.path,
            teamName: '',
            count: 0,
            researchFieldId: '',
        };
        Team.teamId = `NH${Math.floor(10000000 + Math.random() * 90000000)}`; // tạo mã nhóm
        ResearchField.id = `${Math.floor(10000000 + Math.random() * 90000000)}`; // tạo mã lĩnh vực nghiên cứu
        Team.researchFieldId = ResearchField.id;

        try {
            await ResearchFieldModel.AddNewResearchField(ResearchField); // thêm mới lĩnh vực nghiên cứu
            await TeamModel.AddNewTeamFile(Team); // thêm mới team nhưng chỉ up load file
            return res.status(200).json({ teamId: Team.teamId, researchFieldId: Team.researchFieldId });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'upload file không thành công, vui lòng thử lại.' });
        }
    }
    // put /UpdateFile
    async UpDateFile(req, res, next) {
        if (!req.file) {
            next(new Error('No file uploaded!'));
            return res.status(400).json({ msg: 'Cập nhật thông tin không thành công, vui lòng thử lại.' });
        }
        try {
            const teamOfDataBase = await teamModel.GetTeamByTeamId(req.headers.teamid);
            const team = {
                teamId: teamOfDataBase.MaNhom,
                url: req.file.path,
                teamName: teamOfDataBase.TenNhom,
                count: teamOfDataBase.SoLuongThanhVien,
            };

            await teamModel.UpdateTeam(team);
            return res.status(200).json({ msg: 'Cập nhật thông tin thành công}' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Cập nhật thông tin không thành công, vui lòng thử lại.' });
        }
    }
    // Get /show-infomation
    async GetAllInfomation(req, res, next) {
        try {
            const studentInfomation = await studentModel.GetAllInfomationByEmail(req.user.Email);

            const rearchQuestion = await ResearchQuestionModel.GetResearchQuestionByResearchFieldId(
                studentInfomation.MaLinhVucNghienCuu,
            );

            const lecturersInfomation = await lecturersModel.GetLecturersByTeamId(studentInfomation.MaNhom);

            const returnedInfomation = {
                studentInfomation: studentInfomation,
                rearchQuestion: rearchQuestion,
                lecturersInfomation: lecturersInfomation,
            };
            return res.status(200).json(returnedInfomation);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    }
    // Get /show-infomation-pesonal
    async GetAllInfomationPesonal(req, res, next) {
        try {
            const studentInfomation = await studentModel.GetAllInfomationByEmail(req.user.Email);

            const rearchQuestion = await ResearchQuestionModel.GetResearchQuestionByResearchFieldId(
                studentInfomation.MaLinhVucNghienCuu,
            );

            const lecturersInfomation = await lecturersModel.GetLecturersByTeamIdAndStageId(studentInfomation.MaNhom);

            const returnedInfomation = {
                studentInfomation: studentInfomation,
                rearchQuestion: rearchQuestion,
                lecturersInfomation: lecturersInfomation,
            };

            if (!returnedInfomation) {
                return res.status(204).json({ msg: 'no content' });
            }
            return res.status(200).json(returnedInfomation);
        } catch (error) {
            console.log(error);
            return res.status(500).join({ msg: error });
        }
    }
    // Get /get-team
    async GetTeam(req, res, next) {
        try {
            const teamInfomation = await teamModel.GetTeamByTeamId(req.headers.teamid);
            const rearchQuestion = await ResearchQuestionModel.GetResearchQuestionByResearchFieldId(
                teamInfomation.MaLinhVucNghienCuu,
            );

            const returnedInfomation = {
                teamInfomation: teamInfomation,
                rearchQuestion: rearchQuestion,
            };
            return res.status(200).json(returnedInfomation);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [GET]/get-team-studentid
    async GetTeamByStudentID(req, res, next) {
        try {
            const acc = await accountModel.GetEmailByStudentId(undefined, req.user.Email);
            const team = await teamModel.GetTeamByStudentId(acc.MaSinhVien);
            if (team.length === 0) {
                return res.status(204).json({ msg: 'Không tìm thấy nhóm' });
            }

            return res.status(200).json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }

    //  put/update-team
    async UpdateTeam(req, res, next) {
        try {
            const teamOfDataBase = await TeamModel.GetTeamByTeamId(req.body.teamId);
            if (!teamOfDataBase) {
                return res.status(400).json({ msg: 'Mã nhóm không đúng, vui lòng kiểm tra lại' });
            }

            let team = {
                teamId: teamOfDataBase.MaNhom,
                url: teamOfDataBase.LyLichThanhVien,
                teamName: teamOfDataBase.TenNhom,
                count: teamOfDataBase.SoLuongThanhVien,
            };
            team.teamName = !req.body.teamName ? teamOfDataBase.TenNhom : req.body.teamName;
            team.count = !req.body.count ? teamOfDataBase.SoLuongThanhVien : req.body.count;

            const isScucess = await TeamModel.UpdateTeam(team);
            if (isScucess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng kiểm tra lại.' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //  put/update-researchfield
    async UpdateRearchfield(req, res, next) {
        try {
            const researchField = req.body;
            const isScucess = await ResearchFieldModel.UpdateResearchField(researchField);
            if (isScucess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng kiểm tra lại.' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // [PUT] update-researchfield-topic-name
    async UpdateRearchfieldToppicName(req, res, next) {
        try {
            const researchField = req.body;
            if (!req.headers.teamid) {
                return res.status(404).json({ msg: 'not found' });
            }

            const team = await teamModel.GetTeamByTeamId(req.headers.teamid);
            if (!team) {
                return res.status(400).json({ msg: 'Cập nhật không thành công, vui lòng thử lại.' });
            }

            await ResearchFieldModel.UpdateTopicNameOfResearchField(researchField.topicName, team.MaLinhVucNghienCuu);

            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //post /add-new-pairing
    async AddNewParing(req, res, next) {
        let Pairing = req.body;
        const date = new Date();
        Pairing.dateRegister = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
        Pairing.dateOk = Pairing.dateRegister;
        Pairing.personalOpinion = false;

        try {
            const count = await PairingModel.validateIsRegisted(Pairing);
            if (count.length >= 2) {
                return res.status(400).json({ msg: 'Số lượng giảng viên hướng dẫn đã tối đa' });
            }

            const isRegisted = await PairingModel.GetPairing(Pairing);
            if (isRegisted) {
                return res.status(400).json({ msg: 'Bạn đã đăng ký giảng viên này rồi' });
            }

            const isScucess = await PairingModel.AddNewPairing(Pairing);
            if (isScucess.changedRows === 0) {
                return res.status(400).json({ msg: 'Đăng ký không thành công, vui lòng thử lại' });
            }
            res.status(201).json({ msg: 'Đăng ký thành công.' });

            // gửi thông báo
            const email = (await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(req.body.lecturersId)).Email;
            if (!email) {
                return;
            }
            const teamInfomation = await teamModel.GetTeamByTeamId(req.body.teamId);

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `
                Đã có một nhóm sinh viên đăng ký bạn làm giảng viên hướng dẫn <br/>
                Thông tin nhóm: <br/>
                Tên nhóm: ${teamInfomation.TenNhom}  <br/>
                Số lượng thành viên: ${teamInfomation.SoLuongThanhVien}  <br/>
                Tên lĩnh vực nghiên cứu: ${teamInfomation.TenLinhVucNghienCuu}  <br/>
                Tên đề tài nghiên cứu: ${teamInfomation.TenDeTaiNghienCuu}  <br/>
                Lý lịch thành viên: ${teamInfomation.LyLichThanhVien}  <br/>
            `;

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
    // put /:slug/upload-file-report
    async UpLoadFileReport(req, res, next) {
        if (!req.file) {
            return res.status(400).json({ msg: 'Upload file không thành công, vui lòng thử lại.' });
        }

        try {
            const createAt = req.report[0].NgayBatDau;
            const deadline = req.report[0].HanNopBaoCao;
            const dateOfFliling = new Date();
            req.report.forEach((item) => {
                const report = {
                    reportId: item.ReportId,
                    title: item.TieuDe,
                    deadline: [deadline.getFullYear(), deadline.getMonth() + 1, deadline.getDate()].join('-'),
                    createAt: [createAt.getFullYear(), createAt.getMonth() + 1, createAt.getDate()].join('-'),
                    dateOfFliling: [
                        dateOfFliling.getFullYear(),
                        dateOfFliling.getMonth() + 1,
                        dateOfFliling.getDate(),
                    ].join('-'),
                    url: req.file.path,
                    note: item.Note,
                    lecturersId: item.MaGiangVienDk,
                    teamId: item.MaNhom,
                    stageId: item.Id,
                    isFiling: true,
                };
                reportModel.UpdateReport(report);
            });
            res.status(200).json({ msg: 'Cập nhật thành công!' });
            // gửi thông báo
            let email = [];
            for (let i = 0; i < req.report.length; i++) {
                email.push(
                    (await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(req.report[i].MaGiangVienDk)).Email,
                );
            }
            if (email.length === 0) {
                return;
            }
            console.log(email);
            const teamInfomation = await teamModel.GetTeamByTeamId(req.report[0].MaNhom);
            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);
            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `
                Đã có một nhóm sinh viên nộp báo cáo<br/>
                Thông tin nhóm: <br/>
                Tên nhóm: ${teamInfomation.TenNhom}  <br/>
                Số lượng thành viên: ${teamInfomation.SoLuongThanhVien}  <br/>
                Tên lĩnh vực nghiên cứu: ${teamInfomation.TenLinhVucNghienCuu}  <br/>
                Tên đề tài nghiên cứu: ${teamInfomation.TenDeTaiNghienCuu}  <br/>
                Lý lịch thành viên: ${teamInfomation.LyLichThanhVien}  <br/>
                <br/>
                Thông tin báo cáo:<br/>
                Tiêu đề: ${req.report[0].title}<br/>
                Ngày tạo: ${req.report[0].createAt}<br/>
                file báo cáo: ${req.report[0].url}
            `;
            const msg = {
                to: email,
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
            return res.status(500).json({ msg: 'Update không thành công' });
        }
    }
    // PUT /:slug/update-ResearchQuestion
    async UpdateResearchQuestion(req, res, next) {
        try {
            const questionId = req.headers.questionid;
            const ResearchQuestionFromDatabase = await ResearchQuestionModel.GetResearchQuestionByquestionId(
                questionId,
            );

            if (!ResearchQuestionFromDatabase) {
                const isScucess = await ResearchQuestionModel.AddNewResearchQuestion(
                    req.body.content,
                    req.headers.researchfieldid,
                );

                if (isScucess.affectedRows === 0) {
                    return res.status(400).json({ msg: 'Thêm mới câu hỏi không thành công' });
                }
                return res.status(200).json({ msg: 'Thêm mới câu hỏi thành công' });
            }

            const ResearchQuestion = {
                content: !req.body.content ? ResearchQuestionFromDatabase.NoiDungCauHoi : req.body.content,
                researchFieldId: !req.body.researchFieldId
                    ? ResearchQuestionFromDatabase.MaLinhVucNghienCuu
                    : req.body.researchFieldId,
            };

            const isScucess = await ResearchQuestionModel.UpdateResearchQuetion(ResearchQuestion, questionId);
            if (isScucess.changedRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }
            return res.status(200).json({ msg: 'Cập nhật thành công.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // Delete /:slug/delete-ResearchQuestion
    async DeleteResearchQuestion(req, res, next) {
        try {
            const questionId = req.headers.questionid;
            const isScucess = await ResearchQuestionModel.DeleteResearchQuetionByQuestionId(questionId);

            if (isScucess.affectedRows === 0) {
                return res.status(400).json({ msg: 'Xóa câu hỏi không thành công' });
            }

            return res.status(200).json({ msg: 'Xóa thành công' });
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }
    //[GET] /get-student
    async GetStudent(req, res, next) {
        try {
            const studentId = (await accountModel.GetEmailByStudentId(undefined, req.user.Email)).MaSinhVien;
            const StudentFromDatabase = await studentModel.GetStudentByStudentId(studentId);

            const Student = {
                studentId: StudentFromDatabase.MaSinhVien,
                studentName: StudentFromDatabase.HoTen,
                birthDay: StudentFromDatabase.NgaySinh,
                className: StudentFromDatabase.Lop,
                email: StudentFromDatabase.Email,
            };
            if (!Student) {
                return res.status(204).json({ msg: 'no content' });
            }
            return res.status(200).json(Student);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    //[DELETE] /delete-pairing
    async DeletePairing(req, res, next) {
        const pairing = req.body;

        try {
            const isSuccess = await PairingModel.DeletePairing(pairing);
            if (isSuccess.changedRows === 0) {
                return res.status(400).json({ msg: 'Xóa không thành công' });
            }
            res.status(200).json({ msg: 'Xóa thành công' });

            // gửi thông báo
            const email = (await lecturersModel.GetEmailOfLecturersByLecturersRegistedId(req.body.lecturersId)).Email;
            if (!email) {
                return;
            }
            const teamInfomation = await teamModel.GetTeamByTeamId(req.body.teamId);

            const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
            const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
            sgMail.setApiKey(sengridApiKey);

            const subject = 'Thông báo từ website đăng ký module học thuật trường Đại Học Y Dược Hải Phòng';
            const content = `
                Đã có một nhóm sinh viên hủy đăng ký bạn làm giảng viên hướng dẫn <br/>
                Thông tin nhóm:<br/>
                Tên nhóm: ${teamInfomation.TenNhom}<br/>
                Số lượng thành viên: ${teamInfomation.SoLuongThanhVien}<br/>
                Tên lĩnh vực nghiên cứu: ${teamInfomation.TenLinhVucNghienCuu}<br/>
                Tên đề tài nghiên cứu: ${teamInfomation.TenDeTaiNghienCuu}<br/>
                Lý lịch thành viên: ${teamInfomation.LyLichThanhVien}<br/>
            `;

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

    // GET  /get-all-report
    async GetAllReport(req, res, next) {
        try {
            if (!req.headers.teamid || !req.headers.stageid) {
                return res.status(401).json({ msg: 'Không đủ thông tin' });
            }

            const report = {
                teamId: req.headers.teamid,
                Id: req.headers.stageid,
            };

            const Reports = await reportModel.GetAllReportOfStudent(report);
            let ReportOfRes = [];

            if (Reports.length <= 0) {
                return res.status(200).json(ReportOfRes);
            }

            Reports.forEach((report) => {
                const reportOfRes = {
                    reportId: report.ReportId,
                    title: report.TieuDe,
                    deadline: report.HanNopBaoCao,
                    createAt: report.NgayBatDau,
                    dateOfFliling: report.NgayNopBaoCao,
                    note: report.Note,
                    lecturersId: report.MaGiangVienDk,
                    teamId: report.MaNhom,
                    stageId: report.Id,
                    isFiling: report.isFiling,
                };
                ReportOfRes.push(reportOfRes);
            });

            return res.status(200).json(ReportOfRes);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    // GET /get-report
    async GetReport(req, res, next) {
        try {
            if (!req.headers.teamid || !req.headers.stageid) {
                return res.status(400).json({ msg: 'Không đủ thông tin' });
            }

            const report = await reportModel.GetReportByTeamIdAndStageId(req.headers.teamid, req.headers.stageid);

            if (report.length === 0) {
                return res.status(400).json({ msg: 'Không tim thấy report' });
            }

            const team = await teamModel.GetTeamByTeamId(report[0].MaNhom);
            let lecturersName = [];
            report.forEach((item) => {
                lecturersName.push(item.HoTen);
            });

            let createAt = report[0].NgayBatDau;
            let deadline = report[0].HanNopBaoCao;
            let dateOfFliling = report[0].NgayNopBaoCao;

            const reportOfRes = {
                reportId: report[0].ReportId,
                title: report[0].TieuDe,
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
                note: report[0].Note,
                lecturersId: report[0].MaGiangVienDk,
                teamId: report[0].MaNhom,
                stageId: report[0].Id,
                isFiling: report[0].isFiling,
                lecturersName: lecturersName,
                teamName: team.TenNhom,
                fileReport: report[0].FileBaoCao,
            };
            return res.status(200).json(reportOfRes);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
}

module.exports = new StudentController();
