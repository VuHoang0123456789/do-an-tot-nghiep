const db = require('../../config/db');
class LecturerstModel {
    GetEmailOfLecturersByLecturersRegistedId(lecturersRegistedId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Lecturers.MaGiangVien, Lecturers.Email,
                Lecturers.HoTen, NgaySinh, FileLyLichUrl, 
                FileAnhUrl, TenNgonNguHuongDan, TenChuyenNganhHuongDan, count
            FROM LecturersRegistered 
                JOIN RegisterAsAnInstructor ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
                JOIN Lecturers ON RegisterAsAnInstructor.MaGiangVien = Lecturers.MaGiangVien 
            WHERE 
                LecturersRegistered.MaGiangVienDk = '${lecturersRegistedId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetLecturersToAllStage(lecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Lecturers.MaGiangVien, Lecturers.Email,
                Lecturers.HoTen, NgaySinh, FileLyLichUrl, 
                FileAnhUrl, TenNgonNguHuongDan, TenChuyenNganhHuongDan, count, MaGiangVienDk
            FROM LecturersRegistered 
                JOIN RegisterAsAnInstructor ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
                JOIN Lecturers ON RegisterAsAnInstructor.MaGiangVien = Lecturers.MaGiangVien 
            WHERE 
                Lecturers.MaGiangVien = '${lecturersId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetEmailOfLecturers(lecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Email, HoTen, LecturersRegistered.MaGiangVienDk
            FROM LecturersRegistered 
                JOIN RegisterAsAnInstructor ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
                JOIN Lecturers ON RegisterAsAnInstructor.MaGiangVien = Lecturers.MaGiangVien 
            WHERE 
                RegisterAsAnInstructor.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                        )
                    ) AND LecturersRegistered.MaGiangVienDk = '${lecturersId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }

    GetAllLecturersLast() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select * 
            from 
                    (select LecturersRegistered.MaGiangVienDk, HoTen, NgaySinh, TenHocHamHocVi, TenNgonNguHuongDan, TenChuyenNganhHuongDan
                    from Lecturers join AcademicLevel on Lecturers.MaHocHamHocVi = AcademicLevel.MaHocHamHocVi 
                    join RegisterAsAnInstructor on RegisterAsAnInstructor.MaGiangVien = Lecturers.MagiangVien 
                    join LecturersRegistered on LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk) as kq
                join 
                    (select MaGiangVienDk, COUNT(MaGiangVienDk) as SoLuongNhomCoTheNhan 
                    from Pairing 
                    where Id = (select Id from Stage where NgayBatDau <= now() and NgayKetThuc >= now()) 
                    group by MaGiangVienDk) as kq1 on kq.MaGiangVienDk = kq1.MaGiangVienDk
            WHERE count > 0 and Id IN ( 
                    SELECT 
                        Id 
                    FROM 
                        Stage 
                    WHERE 
                        DKID = ( 
                            SELECT 
                                DKID 
                            FROM 
                                AcademicModulesRegisted
                            WHERE 
                                NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                        ) 
                    )`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetAllLecturersFirt() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                * 
            from 
                Lecturers join AcademicLevel on Lecturers.MaHocHamHocVi = AcademicLevel.MaHocHamHocVi 
                join RegisterAsAnInstructor on RegisterAsAnInstructor.MaGiangVien = Lecturers.MagiangVien 
                join LecturersRegistered on LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
            WHERE count > 0 and Id IN ( 
                SELECT 
                    Id 
                FROM 
                    Stage 
                WHERE 
                    DKID = ( 
                        SELECT 
                            DKID 
                        FROM 
                            AcademicModulesRegisted
                        WHERE 
                            NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetLecturersByTeamId(TeamId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                LecturersRegistered.MaGiangVienDk, HoTen, NgaySinh, 
                TenHocHamHocVi, TenNgonNguHuongDan, TenChuyenNganhHuongDan,  
                YKienGiangVien, FileAnhUrl, FileLyLichUrl 
            from 
                Pairing join LecturersRegistered on Pairing.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                join RegisterAsAnInstructor on LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
                join Lecturers on Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                join AcademicLevel on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi 
            where 
                Pairing.MaNhom = "${TeamId}"`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetLecturersByTeamIdAndStageId(TeamId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                LecturersRegistered.MaGiangVienDk, HoTen, NgaySinh, 
                TenHocHamHocVi, TenNgonNguHuongDan, TenChuyenNganhHuongDan,  
                YKienGiangVien, FileAnhUrl, FileLyLichUrl 
            from 
                Pairing join LecturersRegistered on Pairing.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                join RegisterAsAnInstructor on LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk 
                join Lecturers on Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                join AcademicLevel on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi 
            where 
                Pairing.MaNhom = "${TeamId}" AND YKienGiangVien = 1`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetLecturersByLecturersId(LecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                Lecturers.HoTen, NgaySinh, TenHocHamHocVi, Email,  
                LecturersRegistered.MaGiangVienDk, FileLyLichUrl, 
                FileAnhUrl, TenNgonNguHuongDan, TenChuyenNganhHuongDan, count
            from 
                AcademicLevel join Lecturers on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi
                join RegisterAsAnInstructor on RegisterAsAnInstructor.MaGiangVien = Lecturers.MaGiangVien
                join LecturersRegistered on LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            where 
                Lecturers.MaGiangVien = '${LecturersId}';`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetStudentLecturersId(LecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `select * from Lecturers where MaGiangVien  = '${LecturersId}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetLecturersByEmailPlatfrom(Email) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                *
            FROM 
                Lecturers 
                JOIN AcademicLevel on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi 
            WHERE 
                Lecturers.MaGiangVien = 
                (
                    SELECT 
                        LecturersAccount.MaGiangVien 
                    FROM 
                        Account JOIN LecturersAccount ON Account.Email = LecturersAccount.Email 
                    WHERE 
                        LecturersAccount.Email = '${Email}'
                )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetLecturersByEmail(Email) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Lecturers.MaGiangVien, LecturersRegistered.MaGiangVienDk, FileAnhUrl, FileLyLichUrl, NgaySinh,
                TenNgonNguHuongDan, TenChuyenNganhHuongDan, HoTen, Email, TenHocHamHocVi, count
            FROM 
                Lecturers 
                JOIN AcademicLevel on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi 
                JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                JOIN LecturersRegistered ON RegisterAsAnInstructor.MaGiangVienDk = LecturersRegistered.MaGiangVienDk
            WHERE 
                Lecturers.MaGiangVien = 
                (
                    SELECT 
                        LecturersAccount.MaGiangVien 
                    FROM 
                        Account JOIN LecturersAccount ON Account.Email = LecturersAccount.Email 
                    WHERE 
                        LecturersAccount.Email = '${Email}'
                )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetLecturersRegistedByLecturersRegistedId(LecturersRegistedId) {
        return new Promise((resolve, reject) => {
            const queryStr = `select * from LecturersRegistered where MaGiangVienDk = '${LecturersRegistedId}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetLecturersByLecturersRegistedIdAndLecturersId(LecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select RegisterAsAnInstructor.MaGiangVien
            from 
                Lecturers join RegisterAsAnInstructor on Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
            where 
                Lecturers.MaGiangVien = '${LecturersId}' and 
                RegisterAsAnInstructor.Id IN 
                ( 
                    SELECT Id 
                    FROM Stage W
                    WHERE DKID = 
                    ( 
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                        ) 
                )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    AddFileOfLecturersRegisted(Lecturers) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            insert into LecturersRegistered 
                (MaGiangVienDk, FileAnhUrl, FileLyLichUrl, TenNgonNguHuongDan, TenChuyenNganhHuongDan, count) 
            values 
                ('${Lecturers.LecturersId}', '${Lecturers.image_url}', '${Lecturers.background_url}', 
                '${Lecturers.language}', '${Lecturers.specialized}', ${Lecturers.count})`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    AddNewLecturersOfLecturersRegisted(Lecturers) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            update 
                LecturersRegistered 
            set 
                TenNgonNguHuongDan = '${Lecturers.language}', 
                TenChuyenNganhHuongDan = '${Lecturers.specialized}', 
                count = ${Lecturers.count}
            where 
                MaGiangVienDk = '${Lecturers.lecturersRegistedId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    AddRegisterIsLecturersRegisted(RegisterLecturers) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            insert into RegisterAsAnInstructor 
                (ThoiDiemDangKy, Id, MaGiangVienDk, MaGiangVien) 
            values 
                ('${RegisterLecturers.registerDate}', '${RegisterLecturers.stageId}', 
                '${RegisterLecturers.lecturersRegistedId}', '${RegisterLecturers.lecturersId}')`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    UpdateLecturersRegisterd(LecturersRegisted) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            update 
                LecturersRegistered 
            set 
                FileAnhUrl = '${LecturersRegisted.url_imge}', FileLyLichUrl = '${LecturersRegisted.url_background}', 
                TenNgonNguHuongDan = '${LecturersRegisted.language}', count = ${LecturersRegisted.count},
                TenChuyenNganhHuongDan = '${LecturersRegisted.specialized}' 
            where 
                MaGiangVienDk = '${LecturersRegisted.lecturersRegistedId}';`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    UpdateCountLecturersRegisterd(lecturersRegistedId, count) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            update 
                LecturersRegistered 
            set count = ${count}
            where 
                MaGiangVienDk = '${lecturersRegistedId}';`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
}

module.exports = new LecturerstModel();
