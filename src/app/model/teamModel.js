const db = require('../../config/db');
class TeamModel {
    GetTeamByTeamId(TeamId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            select 
                MaNhom, TenNhom, SoLuongThanhVien, LyLichThanhVien, 
                ResearchField.MaLinhVucNghienCuu, TenLinhVucNghienCuu, TenDeTaiNghienCuu, createAt 
            from 
                Team join ResearchField on ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            where MaNhom = '${TeamId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    GetTeamByTeamName(teamName) {
        return new Promise((reslove, reject) => {
            const queryStr = `select * from Team where TenNhom = '${teamName}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    GetTeamByLecturersId(lecturersId, stageId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            select 
                Team.MaNhom, TenNhom, SoLuongThanhVien, LyLichThanhVien, TenLinhVucNghienCuu, HoTen
            from 
                Pairing join Team on Team.MaNhom = Pairing.MaNhom
                join ResearchField on ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
                join RegisterTeam on RegisterTeam.MaNhom = Team.MaNhom
                join Student on Student.MaSinhVien = RegisterTeam.MaSinhVien
            where 
                MaGiangVienDk = '${lecturersId}' and Pairing.Id = '${stageId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    GetTeamByTeamNameAndStudentId(teamName, studentId) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            select * 
            from 
                Team join RegisterTeam on Team.MaNhom = RegisterTeam.MaNhom 
            where 
                TenNhom = '${teamName}' and MaSinhVien = '${studentId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result[0]);
            });
        });
    }
    UpdateTeam(Team) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            update 
                Team 
            set 
                TenNhom ='${Team.teamName}', 
                SoLuongThanhVien = ${Team.count}, 
                LyLichThanhVien = "${Team.url}" 
            where 
                MaNhom = '${Team.teamId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }

    // UpdateCountOfTeam(Team) {
    //     return new Promise((reslove, reject) => {
    //         const queryStr = `update Team set SoLuongThanhVien = ${Team.count} where MaNhom = '${Team.TeamId}'`;
    //         db.query(queryStr, (err, result) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return reslove(result);
    //         });
    //     });
    // }
    // UpdateTeamName(Team) {
    //     return new Promise((reslove, reject) => {
    //         const queryStr = `update Team set TenNhom ='${Team.TeamName}' where MaNhom = '${Team.TeamId}'`;
    //         db.query(queryStr, (err, result) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return reslove(result);
    //         });
    //     });
    // }
    // UpdateTeamFile(Team) {
    //     return new Promise((reslove, reject) => {
    //         const queryStr = `update Team set LyLichThanhVien = "${Team.url}" where MaNhom = (select MaNhom from account join StudentAccount on StudentAccount.email = account.email join Student on Student.MaSinhVien = StudentAccount.MaSinhVien join RegisterTeam on RegisterTeam.MaSinhVien = Student.MaSinhVien where account.email = '${Team.email}');`;
    //         db.query(queryStr, (err, result) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return reslove(result);
    //         });
    //     });
    // }
    AddNewTeamFile(Team) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into Team 
                (LyLichThanhVien, MaNhom, MaLinhVucNghienCuu, TenNhom, SoLuongThanhVien) 
            values 
                ('${Team.url}', '${Team.teamId}', '${Team.researchFieldId}', '',0)`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
}
module.exports = new TeamModel();
