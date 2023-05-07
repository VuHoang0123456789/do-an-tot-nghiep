const db = require('../../config/db');
class LecturerstModel {
    GetAllLecturers() {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select * 
            from 
                (select LecturersRegistered.MaGiangVienDk, HoTen, NgaySinh, TenHocHamHocVi, TenNgonNguHuongDan, TenChuyenNganhHuongDan
                from Lecturers join AcademicLevel on Lecturers.MaHocHamHocVi = AcademicLevel.MaHocHamHocVi 
                join DangKyLamGiangVienHuongDan on DangKyLamGiangVienHuongDan.MaGiangVien = Lecturers.MagiangVien 
                join LecturersRegistered on LecturersRegistered.MaGiangVienDk = DangKyLamGiangVienHuongDan.MaGiangVienDk) as kq
            join 
                (select MaGiangVienDk, COUNT(MaGiangVienDk) as SoLuongNhomCoTheNhan 
                from Pairing 
                where Id = (select Id from GiaiDoan where NgayBatDau <= now() and NgayKetThuc >= now()) 
                group by MaGiangVienDk) as kq1 on kq.MaGiangVienDk = kq1.MaGiangVienDk;`;

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
                join DangKyLamGiangVienHuongDan on LecturersRegistered.MaGiangVienDk = DangKyLamGiangVienHuongDan.MaGiangVienDk 
                join Lecturers on Lecturers.MaGiangVien = DangKyLamGiangVienHuongDan.MaGiangVien 
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
    GetLecturersByLecturersId(LecturersId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                Lecturers.HoTen, NgaySinh, TenHocHamHocVi, Email,  LecturersRegistered.MaGiangVienDk, FileLyLichUrl, FileAnhUrl
            from 
                AcademicLevel join Lecturers on AcademicLevel.MaHocHamHocVi = Lecturers.MaHocHamHocVi
                join DangKyLamGiangVienHuongDan on DangKyLamGiangVienHuongDan.MaGiangVien = Lecturers.MaGiangVien
                join LecturersRegistered on LecturersRegistered.MaGiangVienDk = DangKyLamGiangVienHuongDan.MaGiangVienDk
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
    AddFileOfLecturersRegisted(Lecturers) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            insert into LecturersRegistered 
                (MaGiangVienDk, FileAnhUrl, FileLyLichUrl, TenNgonNguHuongDan, TenChuyenNganhHuongDan) 
            values 
                ('${Lecturers.LecturersId}', '${Lecturers.image_url}', '${Lecturers.background_url}', 
                '${Lecturers.language}', '${Lecturers.specialized}')`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
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
    GetLecturersByLecturersRegistedIdAndLecturersId(LecturersId, stageId) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select DangKyLamGiangVienHuongDan.MaGiangVien
            from 
                Lecturers join DangKyLamGiangVienHuongDan on Lecturers.MaGiangVien = DangKyLamGiangVienHuongDan.MaGiangVien 
            where 
                Lecturers.MaGiangVien = '${LecturersId}' and Id = ${stageId}`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
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
                TenChuyenNganhHuongDan = '${Lecturers.specialized}' 
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
            insert into DangKyLamGiangVienHuongDan 
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
                TenNgonNguHuongDan = '${LecturersRegisted.language}', 
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
}

module.exports = new LecturerstModel();
