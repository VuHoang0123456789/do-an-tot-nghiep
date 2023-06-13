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
            const queryStr = `
            select * 
            from 
                (
                    select * 
                    from Student
                    where MaSinhVien =
                    (
                        select MaSinhVien 
                        from StudentAccount 
                        where email = '${email}'
                    )
                ) as Student 
                join RegisterTeam on Student.MaSinhVien = RegisterTeam.MaSinhVien 
                join Team on Team.MaNhom = RegisterTeam.MaNhom
                join ResearchField on ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu;`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetStudentByTeamId(TeamId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
               *
            FROM 
                Team JOIN RegisterTeam ON Team.MaNhom = RegisterTeam.MaNhom
                JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            WHERE 
                Team.MaNhom = '${TeamId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetEmailOfTeam(teamId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Email, TenNhom, HoTen, Team.MaNhom
            FROM 
                Team JOIN RegisterTeam ON Team.MaNhom = RegisterTeam.MaNhom
                JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            WHERE 
                RegisterTeam.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT 
                            DKID 
                        FROM 
                            AcademicModulesRegisted 
                        WHERE 
                            NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                ) 
            ) AND Team.MaNhom = '${teamId}'`;

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
