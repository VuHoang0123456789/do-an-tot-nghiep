const db = require('../../config/db');
class AdminModel {
    GetAdminId(AdminId) {
        return new Promise((resolve, reject) => {
            const queryStr = `select * from Admin where id  = '${AdminId}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    // paing
    GetAllPairing() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                TenNhom, leaderName, kq.MaNhom, studentEmail, 
                TenGiangVien, kq1.MaGiangVienDk, lecturersEmail
            FROM (
                SELECT 
                    Team.TenNhom, Student.HoTen AS leaderName, Team.MaNhom, Email AS studentEmail
                FROM Student 
                    JOIN RegisterTeam ON Student.MaSinhVien = RegisterTeam.MaSinhVien
                    JOIN Team ON Team.MaNhom = RegisterTeam.MaNhom
                    JOIN ResearchField ON ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            ) AS kq JOIN Pairing ON Pairing.MaNhom = kq.MaNhom JOIN (
                SELECT
                    HoTen AS TenGiangVien, LecturersRegistered.MaGiangVienDk, Email AS lecturersEmail
                FROM Lecturers 
                    JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                    JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            ) AS kq1 ON kq1.MaGiangVienDk = Pairing.MaGiangVienDk
            WHERE 
                Pairing.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = ( 
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                ) AND Pairing.YKienGiangVien = 1`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetPairings() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT * 
            FROM (
                SELECT 
                    Team.TenNhom, Student.HoTen AS leaderName, Team.SoLuongThanhVien, ResearchField.TenLinhVucNghienCuu, Team.MaNhom 
                FROM Student 
                    JOIN RegisterTeam ON Student.MaSinhVien = RegisterTeam.MaSinhVien
                    JOIN Team ON Team.MaNhom = RegisterTeam.MaNhom
                    JOIN ResearchField ON ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            ) AS kq JOIN Pairing ON Pairing.MaNhom = kq.MaNhom JOIN (
                SELECT
                    HoTen, LecturersRegistered.TenChuyenNganhHuongDan, LecturersRegistered.MaGiangVienDk
                FROM Lecturers 
                    JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                    JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            ) AS kq1 ON kq1.MaGiangVienDk = Pairing.MaGiangVienDk
            WHERE 
                Pairing.Id = (
                    SELECT Id 
                    FROM Stage 
                    WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                ) `;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetTeamCurrent() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT DISTINCT(Team.TenNhom), Team.MaNhom
            FROM 
                Team JOIN Pairing ON Team.MaNhom = Pairing.MaNhom
            WHERE Pairing.Id IN (
                SELECT Id 
                FROM Stage 
                WHERE DKID = (
                    SELECT DKID 
                    FROM AcademicModulesRegisted 
                    WHERE NgayBatDau<= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                )
            )
            ORDER BY Team.TenNhom ASC
            `;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    GetLecturersIdStatiscal() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT DISTINCT(MaGiangVienDk)
            FROM Report
            WHERE Id IN (
                SELECT Id 
                FROM (
                    SELECT ROW_NUMBER() over (ORDER BY NgayBatDau) AS STT, Id
                    FROM Stage 
                    WHERE DKID =  (
                        SELECT DKID
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                    ) 
                    ORDER BY NgayBatDau
                ) AS kq
                WHERE STT > 4
            )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetLecturersIdStatiscalDate(date_start, date_end) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT DISTINCT(MaGiangVienDk)
            FROM Report
            WHERE Id IN (
                SELECT Id 
                FROM (
                    SELECT ROW_NUMBER() over (ORDER BY NgayBatDau) AS STT, Id
                    FROM Stage 
                    WHERE DKID =  (
                        SELECT DKID
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= '${date_start}' AND NgayKetThuc >= '${date_end}'
                    ) 
                    ORDER BY NgayBatDau
                ) AS kq
                WHERE STT > 4
            )`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetReportByLecturersId(lecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Report.RatingRate, Report.TieuDe, Report.isFiling, ResearchField.TenDeTaiNghienCuu, Lecturers.HoTen
            FROM Report 
                JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = Report.MaGiangVienDk
                JOIN RegisterAsAnInstructor ON RegisterAsAnInstructor.MaGiangVienDk = LecturersRegistered.MaGiangVienDk
                JOIN Lecturers ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                JOIN Team ON Team.MaNhom = Report.MaNhom
                JOIN ResearchField ON ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            WHERE Report.Id IN (
                SELECT Id 
                FROM (
                    SELECT ROW_NUMBER() over (ORDER BY NgayBatDau) AS STT, Id
                    FROM Stage 
                    WHERE DKID =  (
                        SELECT DKID
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                    ) 
                    ORDER BY NgayBatDau
                ) AS kq
                WHERE STT > 4
            ) AND Report.MaGiangVienDk = '${lecturersId}'
            ORDER BY Report.NgayBatDau ASC`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetReportByLecturersIdDate(lecturersId, date_start, date_end) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Report.RatingRate, Report.TieuDe, Report.isFiling, ResearchField.TenDeTaiNghienCuu, Lecturers.HoTen
            FROM Report 
                JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = Report.MaGiangVienDk
                JOIN RegisterAsAnInstructor ON RegisterAsAnInstructor.MaGiangVienDk = LecturersRegistered.MaGiangVienDk
                JOIN Lecturers ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                JOIN Team ON Team.MaNhom = Report.MaNhom
                JOIN ResearchField ON ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            WHERE Report.Id IN (
                SELECT Id 
                FROM (
                    SELECT ROW_NUMBER() over (ORDER BY NgayBatDau) AS STT, Id
                    FROM Stage 
                    WHERE DKID =  (
                        SELECT DKID
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= '${date_start}' AND NgayKetThuc >= '${date_end}'
                    ) 
                    ORDER BY NgayBatDau
                ) AS kq
                WHERE STT > 4
            ) AND Report.MaGiangVienDk = '${lecturersId}'
            ORDER BY Report.NgayBatDau ASC`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetPairingsStatiscalDate(date_start, date_end) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                TenNhom, getTeam.HoTen AS TenSinhVien,  SoDienThoai, LyLichThanhVien, TenLinhVucNghienCuu,
                getLecturers.HoTen AS TenGiangVien, DonViCongtac, YKienGiangVien, MaGiangVienDk, TenNhom,
                 getPairing.MaGiangVienDk, getTeam.MaNhom
            FROM (
                SELECT Pairing.MaGiangVienDk, Pairing.MaNhom, Pairing.YKienGiangVien
                FROM Pairing 
                WHERE Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = ( 
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= '${date_start}' AND NgayKetThuc >= '${date_end}' 
                    ) 
                )
            ) AS getPairing JOIN
            (
                SELECT 
                    Lecturers.HoTen, Lecturers.DonViCongtac, 
                    LecturersRegistered.count AS SoLuongNhomHD, LecturersRegistered.MaGiangVienDk
                FROM 
                    Lecturers 
                    JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                    JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            ) AS getLecturers ON getPairing.MaGiangVienDk = getLecturers.MaGiangVienDk JOIN
            (
                SELECT 
                    TenNhom, HoTen, LyLichThanhVien, TenLinhVucNghienCuu, SoDienThoai, Team.MaNhom
                FROM 
                    Team Team JOIN ResearchField ON Team.MaLinhVucNghienCuu = ResearchField.MaLinhVucNghienCuu
                    JOIN RegisterTeam ON RegisterTeam.MaNhom = Team.MaNhom 
                    JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            ) AS getTeam ON getTeam.MaNhom = getPairing.MaNhom`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    GetPairingsStatiscal() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                TenNhom, getTeam.HoTen AS TenSinhVien,  SoDienThoai, LyLichThanhVien, TenLinhVucNghienCuu,
                getLecturers.HoTen AS TenGiangVien, DonViCongtac, YKienGiangVien, getPairing.MaGiangVienDk, getTeam.MaNhom
            FROM (
                SELECT Pairing.MaGiangVienDk, Pairing.MaNhom, Pairing.YKienGiangVien
                FROM Pairing 
                WHERE Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = ( 
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                )
            ) AS getPairing JOIN
            (
                SELECT 
                    Lecturers.HoTen, Lecturers.DonViCongtac, 
                    LecturersRegistered.count AS SoLuongNhomHD, LecturersRegistered.MaGiangVienDk
                FROM 
                    Lecturers 
                    JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                    JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            ) AS getLecturers ON getPairing.MaGiangVienDk = getLecturers.MaGiangVienDk JOIN
            (
                SELECT 
                    TenNhom, HoTen, LyLichThanhVien, TenLinhVucNghienCuu, SoDienThoai, Team.MaNhom
                FROM 
                    Team Team JOIN ResearchField ON Team.MaLinhVucNghienCuu = ResearchField.MaLinhVucNghienCuu
                    JOIN RegisterTeam ON RegisterTeam.MaNhom = Team.MaNhom 
                    JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            ) AS getTeam ON getTeam.MaNhom = getPairing.MaNhom`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetPairing(id) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT * 
            FROM (
                SELECT 
                    Team.TenNhom, Student.HoTen AS leaderName, Team.SoLuongThanhVien, ResearchField.TenLinhVucNghienCuu, Team.MaNhom 
                FROM Student 
                    JOIN RegisterTeam ON Student.MaSinhVien = RegisterTeam.MaSinhVien
                    JOIN Team ON Team.MaNhom = RegisterTeam.MaNhom
                    JOIN ResearchField ON ResearchField.MaLinhVucNghienCuu = Team.MaLinhVucNghienCuu
            ) AS kq JOIN Pairing ON Pairing.MaNhom = kq.MaNhom JOIN (
                SELECT
                    HoTen, LecturersRegistered.TenChuyenNganhHuongDan, LecturersRegistered.MaGiangVienDk
                FROM Lecturers 
                    JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                    JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            ) AS kq1 ON kq1.MaGiangVienDk = Pairing.MaGiangVienDk
            WHERE Pairing.Id = (SELECT Id FROM Stage WHERE curdate() >= NgayBatDau and curdate() <= NgayKetThuc) and STT = ${id}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    UpdatePairing(Id, Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            update 
                Pairing 
            set 
                YKienGiangVien = ${Pairing.personalOpinion}, ThoiDiemXacNhan = '${Pairing.dateOk}',
                MaGiangVienDk = '${Pairing.lecturersId}', MaNhom = '${Pairing.teamId}', Id = ${Pairing.stageId} 
            where 
                STT = ${Id}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    // stage
    GetStageAll() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT ROW_NUMBER() over (ORDER BY NgayBatDau) AS STT, Id
            FROM Stage 
            WHERE DKID IN ( SELECT DKID FROM AcademicModulesRegisted WHERE curdate() >= NgayBatDau and curdate() <= NgayKetThuc ) 
            ORDER BY NgayBatDau
            `;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    // stage
    GetStageId() {
        return new Promise((resolve, reject) => {
            const queryStr = `
                    SELECT Id FROM Stage WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                `;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }

    // team
    GetTeam() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Team.MaNhom, TenNhom, SoLuongThanhVien, LyLichThanhVien, ResearchField.MaLinhVucNghienCuu, TenLinhVucNghienCuu, HoTen
            FROM 
                Team Team JOIN ResearchField ON Team.MaLinhVucNghienCuu = ResearchField.MaLinhVucNghienCuu
                JOIN RegisterTeam ON RegisterTeam.MaNhom = Team.MaNhom 
                JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            WHERE 
                Team.MaNhom not IN(
                    SELECT DISTINCT MaNhom 
                    FROM Pairing 
                    WHERE Id IN (
                        SELECT Id 
                        FROM Stage 
                        WHERE DKID = (
                            SELECT DKID 
                            FROM AcademicModulesRegisted
                            WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                        )
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
    // statiscal
    GetAllTeamStatiscal() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Team.MaNhom, TenNhom, SoLuongThanhVien, LyLichThanhVien, ResearchField.MaLinhVucNghienCuu, 
                TenLinhVucNghienCuu, HoTen, Student.SoDienThoai, Student.Lop, ResearchField.TenDeTaiNghienCuu
            FROM 
                Team Team JOIN ResearchField ON Team.MaLinhVucNghienCuu = ResearchField.MaLinhVucNghienCuu
                JOIN RegisterTeam ON RegisterTeam.MaNhom = Team.MaNhom 
                JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            WHERE 
            	RegisterTeam.Id IN (                        
                    SELECT Id 
                        FROM Stage 
                        WHERE DKID = (
                            SELECT DKID 
                            FROM AcademicModulesRegisted
                            WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
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
    GetAllTeamStatiscalDate(date_start, date_end) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Team.MaNhom, TenNhom, SoLuongThanhVien, LyLichThanhVien, ResearchField.MaLinhVucNghienCuu, 
                TenLinhVucNghienCuu, HoTen, Student.SoDienThoai, Student.Lop, ResearchField.TenLinhVucNghienCuu
            FROM 
                Team Team JOIN ResearchField ON Team.MaLinhVucNghienCuu = ResearchField.MaLinhVucNghienCuu
                JOIN RegisterTeam ON RegisterTeam.MaNhom = Team.MaNhom 
                JOIN Student ON Student.MaSinhVien = RegisterTeam.MaSinhVien
            WHERE 
            	RegisterTeam.Id IN (                        
                    SELECT Id 
                        FROM Stage 
                        WHERE DKID = (
                            SELECT DKID 
                            FROM AcademicModulesRegisted
                            WHERE NgayBatDau <= '${date_start}' AND NgayKetThuc >= '${date_end}'
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
    // lecturers
    GetLecturers() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                HoTen, TenChuyenNganhHuongDan, LecturersRegistered.MaGiangVienDk, count AS SoLuongNhomCoTheNhan
            FROM Lecturers
                JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien
                JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            WHERE Id IN (
                        SELECT Id 
                        FROM Stage 
                        WHERE DKID = (
                            SELECT DKID 
                            FROM AcademicModulesRegisted
                            WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                        ) 
                    ) AND count > 0`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    // statiscal
    GetAllLecturersStatiscal() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Lecturers.HoTen, Lecturers.DonViCongtac, LecturersRegistered.count AS SoLuongNhom
            FROM 
                Lecturers 
                JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            WHERE 
                RegisterAsAnInstructor.Id IN (
                SELECT Id 
                FROM Stage 
                WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
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
    GetAllLecturersStatiscalDate(date_start, date_end) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Lecturers.HoTen, Lecturers.DonViCongtac, LecturersRegistered.count AS SoLuongNhom
            FROM 
                Lecturers 
                JOIN RegisterAsAnInstructor ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
                JOIN LecturersRegistered ON LecturersRegistered.MaGiangVienDk = RegisterAsAnInstructor.MaGiangVienDk
            WHERE 
                RegisterAsAnInstructor.Id IN (
                SELECT Id 
                FROM Stage 
                WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= '${date_start}' AND NgayKetThuc >= '${date_end}'
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
    // DotDangKy
    GetAllRegistration() {
        return new Promise((resolve, reject) => {
            const queryStr = `SELECT * FROM AcademicModulesRegisted ORDER BY AcademicModulesRegisted.NgayBatDau ASC`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetRegistration(DKID) {
        return new Promise((resolve, reject) => {
            const queryStr = `SELECT * FROM AcademicModulesRegisted WHERE DKID = ${DKID}`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    AddNewRegistration(Registration) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            INSERT INTO 
                AcademicModulesRegisted(TenDotDangKy,NgayBatDau, NgayKetThuc) 
            VALUES 
                ('${Registration.name}', '${Registration.dateStart}', '${Registration.dateEnd}')`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    UpdateRegistration(DKID, Registration) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            UPDATE 
                AcademicModulesRegisted
            SET 
                TenDotDangKy = '${Registration.name}', NgayBatDau = '${Registration.dateStart}', 
                NgayKetThuc = '${Registration.dateEnd}' WHERE DKID = ${DKID}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    DeleteRegistration(DKID) {
        return new Promise((resolve, reject) => {
            const queryStr = `DELETE FROM AcademicModulesRegisted WHERE DKID = ${DKID}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    //stage
    GetAllStage() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT 
                Id, TenGiaiDoan, Stage.NgayBatDau, 
                Stage.NgayKetThuc, Stage.DKID, AcademicModulesRegisted.TenDotDangKy 
            FROM 
                Stage JOIN AcademicModulesRegisted ON Stage.DKID = AcademicModulesRegisted.DKID 
            ORDER BY NgayBatDau ASC`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetCurrentStages() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT Id, TenGiaiDoan, Stage.NgayBatDau, Stage.NgayKetThuc 
            FROM Stage 
            WHERE DKID IN ( 
                SELECT DKID FROM AcademicModulesRegisted WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                ) 
            ORDER BY NgayBatDau ASC`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    GetStage(id) {
        return new Promise((resolve, reject) => {
            const queryStr = `            
            SELECT 
                Id, TenGiaiDoan, Stage.NgayBatDau, Stage.NgayKetThuc, Stage.DKID, AcademicModulesRegisted.TenDotDangKy 
            FROM 
                Stage JOIN AcademicModulesRegisted ON Stage.DKID = AcademicModulesRegisted.DKID 
            WHERE 
                Id = ${id}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    AddNewStage(Stage) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            INSERT INTO 
                Stage (TenGiaiDoan, NgayBatDau, NgayKetThuc, DKID) 
            VALUES 
                ('${Stage.name}', '${Stage.dateStart}', '${Stage.dateEnd}', ${Stage.DKID})`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    UpdateStage(id, Stage) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            UPDATE 
                Stage 
            SET 
                TenGiaiDoan = '${Stage.name}', NgayBatDau = '${Stage.dateStart}', 
                NgayKetThuc = '${Stage.dateEnd}', DKID = ${Stage.DKID} WHERE Id = ${id}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    DeleteStage(Id) {
        return new Promise((resolve, reject) => {
            const queryStr = `DELETE FROM Stage WHERE Id = ${Id}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    // report
    GetReport(stageId, teamId) {
        return new Promise((resolve, reject) => {
            const queryStr = `SELECT * FROM Report WHERE Id = ${stageId} AND MaNhom = '${teamId}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    GetReportByStageId(stageId) {
        return new Promise((resolve, reject) => {
            const queryStr = `SELECT * FROM Report WHERE Id = ${stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    UpdateReport(report) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            UPDATE 
                Report 
            SET 
                TieuDe = '${report.title}', Note = '${report.note}', NgayBatDau = '${report.dateStart}', HanNopBaoCao = '${report.dateEnd}'
            WHERE 
                MaGiangVienDk = '${report.lecturersId}' AND MaNhom = '${report.teamId}' AND Id = ${report.stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }

                return resolve(result);
            });
        });
    }
    UpdateReportByStageId(report) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            UPDATE 
                Report 
            SET 
                TieuDe = '${report.title}', Note = '${report.note}' 
            WHERE 
                Id = ${report.stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    DeleteReport(report) {
        return new Promise((resolve, reject) => {
            const queryStr = `DELETE FROM Report WHERE MaNhom = '${report.teamId}' AND Id = ${report.stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    DeleteReportByStageId(report) {
        return new Promise((resolve, reject) => {
            const queryStr = `DELETE FROM Report WHERE Id = ${report.stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
}

module.exports = new AdminModel();
