const AccountModel = require('../model/accountModel');
const authMethod = require('../../auth/methods');
const OTPModule = require('../../app/model/otpModule');
const bcrypt = require('bcrypt');
const studentModel = require('../model/studentModel');
const lecturersModel = require('../model/lecturersModel');
const adminModel = require('../model/adminModel');

class AccountController {
    async GetAccount(req, res, next) {
        let user;
        user = await AccountModel.GetEmailByStudentId(undefined, req.user.Email);
        if (user) {
            return res.status(200).json({
                email: req.user.Email,
                showName: req.user.ShowName,
                avatar: req.user.avatar,
                studentId: user.MaSinhVien,
            });
        }

        user = await AccountModel.GetEmailByLecturersId(undefined, req.user.Email);
        if (user) {
            return res.status(200).json({
                email: req.user.Email,
                showName: req.user.ShowName,
                avatar: req.user.avatar,
                studentId: user.MaGiangVien,
            });
        }

        user = await AccountModel.GetEmailByAdminId(undefined, req.user.Email);
        if (user) {
            return res.status(200).json({
                email: req.user.Email,
                showName: req.user.ShowName,
                avatar: req.user.avatar,
                studentId: user.Id,
            });
        }
        return res.status(401).send('Không tìm thấy tài khoản.');
    }
    async UpdateAccount(req, res, next) {
        let account = {
            email: req.user.Email,
            passWord: req.user.PassWord,
            showName: req.user.ShowName,
            avatar: req.user.avatar,
        };

        try {
            if (req.body.passWord) {
                const isPasswordValid = bcrypt.compareSync(req.body.passWord, account.passWord);

                if (!isPasswordValid) {
                    return res.status(401).send('Mật khẩu không chính xác, vui lòng kiểm tra lại.');
                }
                const hashPassword = bcrypt.hashSync(req.body.newPassWord, 8);
                account.passWord = hashPassword;
            }

            account.showName = !req.body.showName ? req.user.ShowName : req.body.showName;
            await AccountModel.UpdateAccount(account);
            return res.status(200).json(account);
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng kiểm tra lại thông tin');
        }
    }
    async UpdateFileOfAccount(req, res, next) {
        if (!req.file) {
            return res.status(400).send('Update file không thành công, vui lòng thử lại.');
        }

        let account = {
            email: req.user.Email,
            passWord: req.user.PassWord,
            showName: req.user.ShowName,
            url_avatar: req.file.path,
        };

        try {
            await AccountModel.UpdateAccount(account);
            return res.status(200).json(account);
        } catch (error) {
            console.log(error);
            return res.status(400).send('Cập nhật không thành công, vui lòng kiểm tra lại thông tin');
        }
    }
    async RegisterAccount(req, res, next) {
        const NewUser = req.body;
        // Kiểm tra người dùng có tồn tại trong hệ thống không
        if (NewUser.typeAccount === '2') {
            const Student = await studentModel.GetStudentByStudentId(NewUser.id);
            if (!Student) {
                return res.status(400).send('Mã sinh viên không đúng, vui lòng kiểm tra lại mã sinh viên');
            }
        }
        if (NewUser.typeAccount === '1') {
            const Lecturers = await lecturersModel.GetStudentLecturersId(NewUser.id);
            if (!Lecturers) {
                return res.status(400).send('Mã giảng viên không đúng, vui lòng kiểm tra lại mã giảng viên');
            }
        }
        if (NewUser.typeAccount === '0') {
            const Admin = await adminModel.GetStudentAdminId(NewUser.id);
            if (!Admin) {
                return res.status(400).send('Mã người quản lý không đúng, vui lòng kiểm tra lại mã người quản lý');
            }
        }
        if ((NewUser.typeAccount !== '0', NewUser.typeAccount !== '1', NewUser.typeAccount !== '2')) {
            return res.status(400).send('Kiểu tài khoản không đúng, vui lòng kiểm tra lại.');
        }

        // kiểm tra otp
        const otpIsVaild = await authMethod.verifyOtp(NewUser);
        if (!otpIsVaild) {
            return res.status(400).send('Mã OTP không đúng, vui lòng kiểm tra lại thông tin');
        }
        await OTPModule.DeleteOTP(NewUser.otp);
        //hash passWord
        const hashPassword = bcrypt.hashSync(NewUser.passWord, 8);
        NewUser.passWord = hashPassword;

        try {
            if (NewUser.verified) {
                return res.status(400).send('Địa chỉ email đã sử dụng rồi, vui lòng đổi qua email khác.');
            }
            await AccountModel.UpdateVerifiedAccount(NewUser.email); // update việc xác minh tài khoản bằng otp
            return res.json({
                msg: 'Tạo tài khoản thành công',
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send('Tạo tài khoản không thành công, vui lòng thử lại');
        }
    }
}

module.exports = new AccountController();
