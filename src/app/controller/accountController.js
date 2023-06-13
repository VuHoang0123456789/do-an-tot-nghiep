const AccountModel = require('../model/accountModel');
const authMethod = require('../../auth/methods');
const OTPModule = require('../../app/model/otpModule');
const bcrypt = require('bcrypt');
const studentModel = require('../model/studentModel');
const lecturersModel = require('../model/lecturersModel');
const adminModel = require('../model/adminModel');
const accountModel = require('../model/accountModel');

class AccountController {
    async GetAccount(req, res, next) {
        try {
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
                    lecturersId: user.MaGiangVien,
                });
            }

            user = await AccountModel.GetEmailByAdminId(undefined, req.user.Email);
            if (user) {
                return res.status(200).json({
                    email: req.user.Email,
                    showName: req.user.ShowName,
                    avatar: req.user.avatar,
                    adminId: user.Id,
                });
            }
            return res.status(204).json({ msg: 'Không tìm thấy tài khoản.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    async UpdateAccount(req, res, next) {
        try {
            let account = {
                email: req.user.Email,
                passWord: req.user.PassWord,
                showName: req.user.ShowName,
                url_avatar: req.user.avatar,
            };

            if (!req.user) {
                return res.status(400).json({ msg: 'Không tim thấy tài khoản' });
            }
            // kiểm tra mật khẩu
            if (req.body.passWord) {
                const isPasswordValid = bcrypt.compareSync(req.body.passWord, account.passWord);

                if (!isPasswordValid) {
                    return res.status(400).json({ msg: 'Mật khẩu không chính xác, vui lòng kiểm tra lại.' });
                }
                const hashPassword = bcrypt.hashSync(req.body.newPassWord, 8);
                account.passWord = hashPassword;
            }

            account.showName = !req.body.showName ? req.user.ShowName : req.body.showName;
            const isSuccess = await AccountModel.UpdateAccount(account);
            if (isSuccess.changeRows === 0) {
                return res.status(400).json({ msg: 'Cập nhật không thành công' });
            }

            return res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
    async ForgotPassWord(req, res, next) {
        try {
            if (!req.body.email && !req.body.Id) {
                return res.status(400).json({ msg: 'Không tìm thấy tên đăng nhập, vui lòng kiểm tra lại.' });
            }

            if (req.body.email) {
                if (parseInt(req.body.typeAccount) === 1) {
                    if (!(await accountModel.GetEmailByLecturersId(undefined, req.body.email))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                }

                if (parseInt(req.body.typeAccount) === 0) {
                    if (!(await accountModel.GetEmailByStudentId(undefined, req.body.email))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                }

                if (parseInt(req.body.typeAccount) === 0) {
                    if (!(await accountModel.GetEmailByAdminId(undefined, req.body.email))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                }
            }
            // người  dùng đăng nhập bằng id
            if (!req.body.email) {
                if (parseInt(req.body.typeAccount) === 1) {
                    if (!(await accountModel.GetEmailByLecturersId(req.body.Id, undefined))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                    req.body.email = (await accountModel.GetEmailByLecturersId(req.body.Id, undefined)).Email;
                }

                if (parseInt(req.body.typeAccount) === 2) {
                    if (!(await accountModel.GetEmailByStudentId(req.body.Id, undefined))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                    req.body.email = (await accountModel.GetEmailByStudentId(req.body.Id, undefined)).Email;
                }

                if (parseInt(req.body.typeAccount) === 0) {
                    if (!(await accountModel.GetEmailByAdminId(req.body.Id, undefined))) {
                        return res
                            .status(400)
                            .json({ msg: 'Tên đăng nhập không đúng, Vui lòng kiểm tra lại thông tin.' });
                    }
                    req.body.email = (await accountModel.GetEmailByAdminId(req.body.Id, undefined)).Email;
                }
            }

            const user = await accountModel.GetAccountByEmail(req.body.email);

            let account = {
                email: user.Email,
                passWord: user.PassWord,
                showName: user.ShowName,
                url_avatar: user.avatar,
                otp: req.body.otp,
            };

            if (req.body.passWord) {
                const hashPassword = bcrypt.hashSync(req.body.passWord, 8);
                account.passWord = hashPassword;
            }

            account.showName = !req.body.showName ? user.ShowName : req.body.showName;
            // verify otp
            const otpIsVaild = await authMethod.verifyOtp(account);
            if (!otpIsVaild) {
                return res.status(400).json({ msg: 'Mã OTP không đúng, vui lòng kiểm tra lại thông tin' });
            }

            const isSuccess = await AccountModel.UpdateAccount(account); // update account
            if (isSuccess.changeRows === 0) {
                return res.status(400).json({ msg: 'Mã OTP không đúng, vui lòng kiểm tra lại thông tin' });
            }

            return res.status(200).json({ msg: 'Mật khẩu của bạn đã được đổi thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }

    async UpdateFileOfAccount(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ msg: 'Update file không thành công, vui lòng thử lại.' });
            }

            let account = {
                email: req.user.Email,
                passWord: req.user.PassWord,
                showName: req.user.ShowName,
                url_avatar: req.file.path,
            };

            const isSuccess = await AccountModel.UpdateAccount(account);
            if (isSuccess.changeRows === 0) {
                return res.status(400).json({ msg: 'Update file không thành công, vui lòng thử lại.' });
            }
            return res.status(200).json({ url_avatar: account.url_avatar, msg: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }

    async RegisterAccount(req, res, next) {
        try {
            const NewUser = {
                ...req.body,
                url_avatar: 'https://khoinguonsangtao.vn/wp-content/uploads/2022/07/avatar-gau-cute.jpg',
                showName: '',
            };

            NewUser.typeAccount = parseInt(req.body.typeAccount);
            // Kiểm tra người dùng có tồn tại trong hệ thống không
            if (NewUser.typeAccount === 2) {
                const Student = await studentModel.GetStudentByStudentId(NewUser.Id);
                if (!Student) {
                    return res.status(400).json({ msg: 'Mã sinh viên không đúng, vui lòng kiểm tra lại mã sinh viên' });
                }
                NewUser.showName = Student.HoTen;
            }
            if (NewUser.typeAccount === 1) {
                const Lecturers = await lecturersModel.GetStudentLecturersId(NewUser.Id);
                if (!Lecturers) {
                    return res
                        .status(400)
                        .json({ msg: 'Mã giảng viên không đúng, vui lòng kiểm tra lại mã giảng viên' });
                }
                NewUser.showName = Lecturers.HoTen;
            }
            if (NewUser.typeAccount === 0) {
                const Admin = await adminModel.GetAdminId(NewUser.Id);
                if (!Admin) {
                    return res
                        .status(400)
                        .json({ msg: 'Mã người quản lý không đúng, vui lòng kiểm tra lại mã người quản lý' });
                }
                NewUser.showName = Admin.HoTen;
            }

            if (
                parseInt(NewUser.typeAccount) !== 0 &&
                parseInt(NewUser.typeAccount) !== 1 &&
                parseInt(NewUser.typeAccount) !== 2
            ) {
                return res.status(400).json({ msg: 'Kiểu tài khoản không đúng, vui lòng kiểm tra lại.' });
            }
            // Kiểm tra tài khoản đã tồn tại chưa
            const user = await accountModel.GetAccountByEmail(NewUser.email);
            if (user) {
                return res.status(400).json({ msg: 'Đã tồn tại tài khoản, vui lòng kiểm tra lại.' });
            }

            // kiểm tra otp
            const otpIsVaild = await authMethod.verifyOtp(NewUser);
            if (!otpIsVaild) {
                return res.status(400).json({ msg: 'Mã OTP không đúng, vui lòng kiểm tra lại thông tin' });
            }
            await OTPModule.DeleteOTP(NewUser.otp);

            // update việc xác minh tài khoản bằng otp
            const hashPassword = bcrypt.hashSync(NewUser.passWord, 8); //Mã hóa mật khẩu
            NewUser.passWord = hashPassword;
            const isSuccess = await AccountModel.InsertUser(NewUser);

            if (isSuccess.changeRows === 0) {
                return res.status(400).json({ msg: 'Tạo tài khoản không thành công, vui lòng kiểm tra lại thông tin' });
            }
            return res.status(201).json({
                msg: 'Tạo tài khoản thành công',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: error });
        }
    }
}

module.exports = new AccountController();
