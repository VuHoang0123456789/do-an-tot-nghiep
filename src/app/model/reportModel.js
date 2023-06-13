const db = require('../../config/db');

class ReportModel {
    GetAllReportOfStudent(report) {
        return new Promise((resolve, reject) => {
            const query_str = `
            select
                ReportId, NgayBatDau, TieuDe, 
                Note, NgayNopBaoCao, HanNopBaoCao,
                isFiling, Report.Id, MaNhom, Report.MaGiangVienDk
            from 
                Report 
            WHERE 
                Report.MaNhom = '${report.teamId}' AND Report.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                )
            GROUP BY Id
            ORDER BY NgayBatDau ASC`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }
    // GetReportByTeamIdAndLEcturrersIdAndStageId(lecturersId, teamId, stageId) {
    //     return new Promise((resolve, reject) => {
    //         const query_str = `
    //         select
    //             ReportId, NgayBatDau, TieuDe,
    //             Note, NgayNopBaoCao, HanNopBaoCao,
    //             isFiling, Report.Id, MaNhom, Report.MaGiangVienDk
    //         from
    //             Report
    //         WHERE
    //             Report.MaNhom = '${teamId}' AND Report.MaGiangVienDk = '${lecturersId}' AND Report.Id = '${stageId}' AND Report.Id IN (
    //                 SELECT Id
    //                 FROM Stage
    //                 WHERE DKID = (
    //                     SELECT DKID
    //                     FROM AcademicModulesRegisted
    //                     WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
    //                 )
    //             )`;

    //         db.query(query_str, (error, result) => {
    //             if (error) {
    //                 return reject(error);
    //             }

    //             return resolve(result[0]);
    //         });
    //     });
    // }
    GetReportByStageId(stageId) {
        return new Promise((resolve, reject) => {
            const query_str = `
            select
                ReportId, NgayBatDau, TieuDe, 
                Note, NgayNopBaoCao, HanNopBaoCao,
                isFiling, Report.Id, MaNhom, Report.MaGiangVienDk
            from 
                Report 
            WHERE 
                Report.Id = '${stageId}' AND Report.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                )`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result[0]);
            });
        });
    }
    GetAllReportOfLecturers(report) {
        return new Promise((resolve, reject) => {
            const query_str = `
            select
                ReportId, NgayBatDau, TieuDe, Note, NgayNopBaoCao, TenNhom,
                HanNopBaoCao, isFiling, Report.Id, Team.MaNhom, Report.MaGiangVienDk 
            from 
                Report join Team on Report.MaNhom = Team.MaNhom
            WHERE 
                Report.MaGiangVienDk = '${report.lecturersId}' AND Report.Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted 
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE() 
                    ) 
                )
            ORDER BY NgayBatDau ASC`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }
    GetReportByTeamIdAndStageId(TeamId, StageId) {
        return new Promise((resolve, reject) => {
            const query_str = `            
            select
                ReportId, NgayBatDau, TieuDe, 
                Note, NgayNopBaoCao, HanNopBaoCao, FileBaoCao,
                isFiling, Report.Id, MaNhom, Report.MaGiangVienDk, HoTen 
            from Report 
                JOIN LecturersRegistered ON Report.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                JOIN RegisterAsAnInstructor ON RegisterAsAnInstructor.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                JOIN Lecturers ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
             WHERE 
             MaNhom  = '${TeamId}' &&  Report.Id = ${StageId}`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }

    GetReportByReportId(ReportId) {
        return new Promise((resolve, reject) => {
            const query_str = `            
            select
                ReportId, NgayBatDau, TieuDe, 
                Note, NgayNopBaoCao, HanNopBaoCao, FileBaoCao,
                isFiling, Report.Id, MaNhom, Report.MaGiangVienDk, HoTen, RatingRate
            from Report 
                JOIN LecturersRegistered ON Report.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                JOIN RegisterAsAnInstructor ON RegisterAsAnInstructor.MaGiangVienDk = LecturersRegistered.MaGiangVienDk 
                JOIN Lecturers ON Lecturers.MaGiangVien = RegisterAsAnInstructor.MaGiangVien 
             WHERE 
             ReportId  = '${ReportId}'`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result[0]);
            });
        });
    }
    AddNewReport(Report) {
        return new Promise((resolve, reject) => {
            const query_str = `CALL AddNewReport(
                '${Report.reportId}', '${Report.title}', '${Report.createAt}', 
                '${Report.deadline}', '${Report.note}', '${Report.dateOfFliling}', 
                '${Report.lecturersId}', '${Report.teamId}', '${Report.stageId}', ${Report.isFiling}
            )`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    UpdateReport(Report) {
        return new Promise((resolve, reject) => {
            const query_str = `
            update 
                Report 
            set 
                TieuDe = '${Report.title}', HanNopBaoCao = '${Report.deadline}', 
                FileBaoCao = '${Report.url}', NgayBatDau = '${Report.createAt}', Note = '${Report.note}', 
                MaNhom = '${Report.teamId}', NgayNopBaoCao = '${Report.dateOfFliling}',
                isFiling = ${Report.isFiling}, Id = ${Report.stageId}, MaGiangVienDk = '${Report.lecturersId}'
            where 
                ReportId = '${Report.reportId}'`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }

    UpdateReportOfLectuers(Report) {
        return new Promise((resolve, reject) => {
            const query_str = `
            update 
                Report 
            set 
                RatingRate = '${Report.rate}'
            where 
                ReportId = '${Report.reportId}'`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }
    DeleteReport(reportId) {
        return new Promise((resolve, reject) => {
            const query_str = `delete from  Report where ReportId = '${reportId}'`;

            db.query(query_str, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }
}

module.exports = new ReportModel();
