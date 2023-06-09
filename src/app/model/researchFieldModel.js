const db = require('../../config/db');
class ResearchFieldModel {
    GetResearchFieldBy(topicName) {
        return new Promise((reslove, reject) => {
            const queryStr = `select * from ResearchField where TenDeTaiNghienCuu = '${topicName}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    AddNewResearchField(ResearchField) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into ResearchField 
                (MaLinhVucNghienCuu, TenLinhVucNghienCuu, TenDeTaiNghienCuu, createAt) 
            values 
                ('${ResearchField.id}', '${ResearchField.name}', '${ResearchField.topicName}', now());`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    UpdateResearchField(ResearchField) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            update 
                ResearchField 
            set 
                TenLinhVucNghienCuu ='${ResearchField.researchFieldName}', 
                TenDetaiNghienCuu = '${ResearchField.topicName}' 
            where 
                MaLinhVucNghienCuu = ${ResearchField.researchFieldId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    UpdateTopicNameOfResearchField(topicName, researchFieldId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            update 
                ResearchField 
            set 
                TenDetaiNghienCuu = '${topicName}' 
            where 
                MaLinhVucNghienCuu = ${researchFieldId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
}
module.exports = new ResearchFieldModel();
