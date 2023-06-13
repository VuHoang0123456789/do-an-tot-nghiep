const db = require('../../config/db');
class OTPModule {
    GetOtp(user, dateNow) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            select 
                otp, creatAt, expireAt 
            from 
                VerifyOTP
            where 
                otp = ${user.otp} and email = '${user.email}' 
                and expireAt > STR_TO_DATE('${dateNow}', '%Y-%m-%d %H:%i:%s')`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    }
    InsertOTP(Otp) {
        return new Promise((resolve, reject) => {
            const queryStr = `
            insert into VerifyOTP 
                (otp, creatAt, expireAt, email) 
            values 
                ('${Otp.otp}', '${Otp.creatAt}','${Otp.expireAt}', '${Otp.email}')`;

            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    DeleteOTP(otp) {
        return new Promise((resolve, reject) => {
            const queryStr = `delete from  VerifyOTP where otp = '${otp}'`;
            db.query(queryStr, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
}

module.exports = new OTPModule();
