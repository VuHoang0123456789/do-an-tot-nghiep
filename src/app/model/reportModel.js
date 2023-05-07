const db = require('../../config/db');

class ReportModel {
    GetAllReport() {
        return new Promise((resolve, reject) => {
            const query_str = `select * from Report;`;
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
            const query_str = `select * from Report where ReportId = '${ReportId}'`;
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
            const query_str = `
            insert into Report 
                (ReportId, TieuDe, NgayBatDau, HanNopBaoCao, Note, NgayNopBaoCao, FileBaoCao, MaGiangVienDk, MaNhom, Id, isFiling) 
            values 
                ('${Report.reportId}','${Report.title}', '${Report.createAt}', 
                '${Report.deadline}', '${Report.note}', '${Report.dateOfFliling}', '', 
                '${Report.lecturersId}', '${Report.teamId}', '${Report.stageId}', ${Report.isFiling});`;

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
                TieuDe = '${Report.title}', NgayNopBaoCao = '${Report.dateOfFliling}',
                HanNopBaoCao = '${Report.deadline}', Note = '${Report.note}', isFiling = ${Report.isFiling},
                NgayBatDau = '${Report.createAt}', FileBaoCao = '${Report.url}', 
                MaGiangVienDk = '${Report.lecturersId}', MaNhom = '${Report.teamId}', Id = ${Report.stageId}
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
}

module.exports = new ReportModel();
