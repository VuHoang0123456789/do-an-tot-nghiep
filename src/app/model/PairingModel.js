const db = require('../../config/db');
class PairingModel {
    GetPairing(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            SELECT
                * 
            FROM 
                Pairing 
            WHERE 
                MaGiangVienDk = '${Pairing.lecturersId}' and MaNhom = '${Pairing.teamId}' 
                and Id IN (
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
                return reslove(result[0]);
            });
        });
    }
    validateIsRegisted(Pairing) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            SELECT *  
            FROM 
                Pairing WHERE MaNhom = '${Pairing.teamId}' AND Id IN (
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
    AddNewPairing(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into Pairing 
                (YKienGiangVien, MaGiangVienDk, ThoiDiemDangKy, ThoiDiemXacNhan, MaNhom, Id) 
            values 
                (${Pairing.personalOpinion}, '${Pairing.lecturersId}', '${Pairing.dateRegister}', '${Pairing.dateOk}', '${Pairing.teamId}', ${Pairing.stageId})`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }

    AddNewPairing2(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into Pairing 
                (YKienGiangVien, MaGiangVienDk, ThoiDiemDangKy, ThoiDiemXacNhan, MaNhom, Id) 
            values 
                (${Pairing.personalOpinion}, '${Pairing.lecturersId}', '${Pairing.dateRegister}', '${Pairing.dateOk}', '${Pairing.teamId}', ${Pairing.stageId})`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }

    UpdatePairing(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `CALL UpdatePairing (${Pairing.personalOpinion}, '${Pairing.lecturersId}', '${Pairing.dateOk}',  '${Pairing.teamId}', ${Pairing.stageId})`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
    DeletePairing(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            delete from Pairing 
            where 
                MaGiangVienDk = '${Pairing.lecturersId}'
                and Id IN (
                    SELECT Id 
                    FROM Stage 
                    WHERE DKID = (
                        SELECT DKID 
                        FROM AcademicModulesRegisted
                        WHERE NgayBatDau <= CURRENT_DATE() AND NgayKetThuc >= CURRENT_DATE()
                )
            ) and MaNhom = '${Pairing.teamId}';`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return reslove(result);
            });
        });
    }
}
module.exports = new PairingModel();
