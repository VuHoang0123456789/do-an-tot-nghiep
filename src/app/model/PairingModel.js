const db = require('../../config/db');
class PairingModel {
    AddNewPairing(Pairing) {
        return new Promise((reslove, reject) => {
            const queryStr = `
            insert into Pairing 
                (YKienGiangVien, MaGiangVienDk, ThoiDiemDangKy, ThoiDiemXacNhan, MaNhom, Id) 
            values 
                (${Pairing.personalOpinion}, '${Pairing.lecturersId}', '${Pairing.dateRegister}', 
                '${Pairing.dateOk}', '${Pairing.teamId}', ${Pairing.stageId});`;

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
            const queryStr = `
            update 
                Pairing 
            set 
                YKienGiangVien = ${Pairing.personalOpinion}, ThoiDiemXacNhan = '${Pairing.dateOk}' 
            where 
                MaGiangVienDk = '${Pairing.lecturersId}' and MaNhom = '${Pairing.teamId}' and Id = ${Pairing.stageId}`;

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
            where MaGiangVienDk = '${Pairing.lecturersId}'and Id = ${Pairing.stageId} and MaNhom = '${Pairing.teamId}';`;
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
