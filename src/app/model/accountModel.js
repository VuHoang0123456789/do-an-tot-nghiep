const db = require('../../config/db');

class AccountModel {
    GetAccountByEmail(Email) {
        return new Promise((resolve, reject) => {
            const querySql = `select * from Account where Email = '${Email}'`;
            db.query(querySql, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
    }
    GetEmailByStudentId(StudentId, email) {
        return new Promise((resolve, reject) => {
            const querySql = `select * from StudentAccount where MaSinhVien = '${StudentId}' or email = '${email}'`;
            db.query(querySql, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
    }
    GetEmailByLecturersId(LecturersId, email) {
        return new Promise((resolve, reject) => {
            const querySql = `select * from LecturersAccount where MaGiangVien = '${LecturersId}' or email = '${email}'`;
            db.query(querySql, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
    }
    GetEmailByAdminId(AdminId, email) {
        return new Promise((resolve, reject) => {
            const querySql = `select * from AdminAccount where Id = '${AdminId}' or email = '${email}'`;
            db.query(querySql, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
    }
    async UpdateRefreshToken(email, refreshToken) {
        const queryStr = `update Account set Account.refreshToken = '${refreshToken}' where Account.email = '${email}'`;
        db.query(queryStr, (err, result) => {
            if (err) {
                throw err;
            }
            console.log(result.affectedRows + ' record(s) updated');
        });
    }
    InsertUser(user) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            call InsertAccount(${parseInt(user.typeAccount)},'${user.Id}', 
            '${user.email}', '${user.passWord}', '${user.showName}', '${user.url_avatar}')`;
            console.log(queryStr);
            db.query(queryStr, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
    UpdateVerifiedAccount(email) {
        return new Promise((resolve, reject) => {
            const queryStr = `update Account set Account.verified = true where Account.email = '${email}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
    UpdateAccount(Account) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            update 
                Account 
            set 
                passWord = '${Account.passWord}', showName = '${Account.showName}', 
                avatar = '${Account.url_avatar}' where email = '${Account.email}'`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
}

module.exports = new AccountModel();
