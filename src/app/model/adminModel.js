const db = require('../../config/db');
class AdminModel {
    GetStudentAdminId(AdminId) {
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
}

module.exports = new AdminModel();
