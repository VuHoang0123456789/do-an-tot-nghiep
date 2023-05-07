const db = require('../../config/db');
class ResearchQuestionModel {
    GetResearchQuestionByResearchFieldId(researchFieldId) {
        return new Promise((reslove, reject) => {
            const queryStr = `select * from ResearchQuestion where MaLinhVucNghienCuu = '${researchFieldId}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    GetResearchQuestionByquestionId(questionId) {
        return new Promise((reslove, reject) => {
            const queryStr = `select * from ResearchQuestion where MaCauHoi = ${questionId}`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    GetResearchQuestion(ResearchQuestion, researchFieldId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            select * 
            from ResearchQuestion 
            where NoiDungCauHoi = '${ResearchQuestion}' and MaLinhVucNghienCuu = '${researchFieldId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    AddNewResearchQuestion(ResearchQuestion, researchFieldId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into ResearchQuestion
                (NoiDungCauHoi, MaLinhVucNghienCuu) 
            values
                ('${ResearchQuestion}', '${researchFieldId}')`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    UpdateResearchQuetion(ResearchQuestion, questionId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            update 
                ResearchQuestion 
            set 
                NoiDungCauHoi = '${ResearchQuestion.content}' 
            where 
                MaCauHoi = ${questionId} and MaLinhVucNghienCuu = '${ResearchQuestion.researchFieldId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    DeleteResearchQuetionByQuestionId(questionId) {
        return new Promise((reslove, reject) => {
            const queryStr = `delete from ResearchQuestion where MaCauHoi = ${questionId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
}
module.exports = new ResearchQuestionModel();
