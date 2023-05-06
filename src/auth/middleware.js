const accountModel = require('../app/model/accountModel');
const authMethod = require('./methods');

exports.isAuth = async (req, res, next) => {
    const accessTokenFromreq = req.headers.token;
    if (!accessTokenFromreq) {
        return res.status(401).send('Không tìm thấy access token!');
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(accessTokenFromreq, accessTokenSecret);
    if (!verified) {
        return res.status(401).send('Bạn không có quyền truy cập vào tính năng này!');
    }

    const user = await accountModel.GetAccountByEmail(verified.payload.email);
    req.user = user;

    return next();
};
