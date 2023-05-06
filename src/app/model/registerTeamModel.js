const db = require('../../config/db');
class RegisterTeamModel {
    AddNewRegisterTeam(RegisterTeam) {
        return new Promise((reslove, reject) => {
            const queryStr = `insert into RegisterTeam (ThoiDiemDangKy, Id, MaSinhVien, MaNhom) values ('${RegisterTeam.registerDate}', ${RegisterTeam.stageId}, '${RegisterTeam.studentId}', '${RegisterTeam.teamId}');`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
}
module.exports = new RegisterTeamModel();
