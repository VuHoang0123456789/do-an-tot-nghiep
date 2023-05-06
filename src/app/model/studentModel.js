const db = require('../../config/db');
class StudentModel {
    GetStudentByStudentId(StudentId) {
        return new Promise((resolve, reject) => {
            const queryStr = `select * from Student where MaSinhVien  = '${StudentId}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetAllInfomationByEmail(email) {
        return new Promise((resolve, reject) => {
            const queryStr = `select * 
            from (select * 
                from Student
                 where MaSinhVien in (select MaSinhVien 
                    from StudentAccount where email = '${email}')) as Student join RegisterTeam on Student.MaSinhVien = RegisterTeam.MaSinhVien 
                    join Team on Team.MaNhom = RegisterTeam.MaNhom;`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
}

module.exports = new StudentModel();
