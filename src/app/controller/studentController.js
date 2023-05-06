const ResearchFieldModel = require('../model/researchFieldModel');
const TeamModel = require('../model/teamModel');
const RegisterTeamModel = require('../model/registerTeamModel');
const ResearchQuestionModel = require('../model/rearchQuestionModel');
const studentModel = require('../model/studentModel');
const lecturersModel = require('../model/lecturersModel');
const teamModel = require('../model/teamModel');
const PairingModel = require('../model/PairingModel');

class StudentController {
    // Đăng ký Platfrom cho sinh viên, sau khi upload file sẽ nhận về 2 mã nhóm và mã sinh viên
    // sau đó cập nhật thêm vào
    // post /student/register-platform/:slug
    async RegisterPlatfrom(req, res, next) {
        const date = new Date();
        let Team = { teamName: req.body.teamName, count: req.body.count, teamId: req.body.teamId };
        let RegisterTeam = {
            registerDate: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
            stageId: req.body.stageId,
            teamId: req.body.teamId,
            studentId: req.body.studentId,
        };
        let ResearchField = {
            researchFieldId: req.body.researchFieldId,
            researchFieldName: req.body.researchFieldName,
            topicName: req.body.topicName,
        };
        let ResearchQuestion = req.body.questions;

        try {
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
        } catch (error) {
            console.log(error);
            return res.status(400).send('Đăng ký không thành công, vui lòng kiểm tra lại thông tin');
        }
        return res.status(200).send('Đăng ký thành công');
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
        } catch (error) {
            console.log(error);
            return res.status(400).json('upload file không thành công, vui lòng thử lại.');
        }

        res.status(200).json({ teamId: Team.teamId, researchFieldId: Team.researchFieldId });
    }
    // put /UpdateFile
    async UpDateFile(req, res, next) {
        if (!req.file) {
            next(new Error('No file uploaded!'));
            return res.status(400).json('update file không thành công, vui lòng thử lại.');
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
            return res.status(200).json('update file thành công');
        } catch (error) {
            console.log(error);
            return res.status(400).json('update file không thành công, vui lòng thử lại.');
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
            return res.status(400).send(error);
        }
    }
    // Get /get-team
    async GetTeam(req, res, next) {
        try {
            const teamInfomation = await teamModel.GetTeamByTeamId(req.body.teamId);

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
            return res.status(400).send(error);
        }
    }
    //  put/update-team
    async UpdateTeam(req, res, next) {
        const teamOfDataBase = await TeamModel.GetTeamByTeamId(req.body.teamId);
        if (!teamOfDataBase) {
            return res.status(401).send('Mã nhóm không đúng, vui long kiểm tra lại');
        }

        try {
            let team = {
                teamId: teamOfDataBase.MaNhom,
                url: teamOfDataBase.LyLichThanhVien,
                teamName: teamOfDataBase.TenNhom,
                count: teamOfDataBase.SoLuongThanhVien,
            };
            team.teamName = !req.body.teamName ? teamOfDataBase.TenNhom : req.body.teamName;
            team.count = !req.body.count ? teamOfDataBase.SoLuongThanhVien : req.body.count;

            await TeamModel.UpdateTeam(team);
            return res.status(200).send('Cập nhật thành công');
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng kiểm tra lại.');
        }
    }
    //put /update-pairing
    async UpdatePairing(req, res, next) {
        const Pairing = req.body;
        const date = new Date();
        Pairing.dateOk = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
        Pairing.personalOpinion = true;

        try {
            await PairingModel.UpdatePairing(Pairing);
            res.status(200).send('Cập nhật thành công.');
        } catch (error) {
            console.log(error);
            res.status(400).send('Cập nhật không thành công, vui lòng kiểm tra lại thông tin.');
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
            await PairingModel.AddNewPairing(Pairing);
            res.status(200).send('Cập nhật thành công.');
        } catch (error) {
            console.log(error);
            res.status(400).send('Cập nhật không thành công, vui lòng kiểm tra lại thông tin.');
        }
    }
    // put /:slug/upload-file-report
    async UpLoadFileReport(req, res, next) {
        if (!req.file) {
            return res.status(400).send('Upload file không thành công, vui lòng thử lại.');
        }
        const createAt = req.report.NgayBatDau;
        const deadline = req.report.HanNopBaoCao;
        const dateOfFliling = req.report.NgayNopBaoCao;

        const report = {
            reportId: req.report.reportId,
            title: req.report.TieuDe,
            deadline: [deadline.getFullYear(), deadline.getMonth() + 1, deadline.getDate()].join('-'),
            createAt: [createAt.getFullYear(), createAt.getMonth() + 1, createAt.getDate()].join('-'),
            dateOfFliling: [dateOfFliling.getFullYear(), dateOfFliling.getMonth() + 1, dateOfFliling.getDate()].join(
                '-',
            ),
            note: req.report.Note,
            lecturersId: req.report.MaGiangVienDk,
            teamId: req.report.MaNhom,
            stageId: req.report.Id,
            isFiling: true,
        };

        return res.status(200).json(report);
    }
    // PUT /:slug/update-ResearchQuestion
    async UpdateResearchQuestion(req, res, next) {
        try {
            const questionId = req.headers.questionid;
            const ResearchQuestionFromDatabase = await ResearchQuestionModel.GetResearchQuestionByquestionId(
                questionId,
            );
            console.log(ResearchQuestionFromDatabase);
            const ResearchQuestion = {
                content: !req.body.content ? ResearchQuestionFromDatabase.NoiDungCauHoi : req.body.content,
                researchFieldId: !req.body.researchFieldId
                    ? ResearchQuestionFromDatabase.MaLinhVucNghienCuu
                    : req.body.researchFieldId,
            };

            await ResearchQuestionModel.UpdateResearchQuetion(ResearchQuestion, questionId);
            return res.status(200).send('Cập nhật thành công.');
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }
    async DeleteResearchQuestion(req, res, next) {
        try {
            const questionId = req.headers.questionid;
            await ResearchQuestionModel.DeleteResearchQuetionByQuestionId(questionId);
            return res.status(200).send('Xóa thành công.');
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }
}
module.exports = new StudentController();
