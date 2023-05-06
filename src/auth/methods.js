const jwt = require('jsonwebtoken');
const otpModule = require('../app/model/otpModule');
const promisify = require('util').promisify;
const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);

exports.generateToken = async (payload, secretSignature, tokenLife) => {
    try {
        return await sign(
            {
                payload,
            },
            secretSignature,
            {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            },
        );
    } catch (error) {
        console.log(`Error in generate access token:  + ${error}`);
        return null;
    }
};
exports.decodeToken = async (token, secretKey) => {
    try {
        return await verify(token, secretKey, {
            ignoreExpiration: true,
        });
    } catch (error) {
        console.log(`Error in decode access token: ${error}`);
        return null;
    }
};
exports.verifyToken = async (token, secretKey) => {
    try {
        return await verify(token, secretKey);
    } catch (error) {
        console.log(`Error in verify access token:  + ${error}`);
        return null;
    }
};
exports.generateOtp = async () => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    return otp;
};
exports.verifyOtp = async (NewUser) => {
    const dateNow = new Date();
    return (await otpModule.GetOtp(NewUser, await this.FormatDate(dateNow))) ? true : false;
};
exports.FormatDate = async (date) => {
    const dformat =
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
        ' ' +
        [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
    return dformat;
};
