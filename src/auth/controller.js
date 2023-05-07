const authMethod = require('./methods');
const AccountModel = require('../app/model/accountModel');
const StudentModel = require('../app/model/studentModel');
const LecturersModel = require('../app/model/lecturersModel');
const AdmiModel = require('../app/model/adminModel');
const randToken = require('rand-token');
const jwtVariable = require('../../variables/jwt');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const OTPModule = require('../app/model/otpModule');
const accountModel = require('../app/model/accountModel');

class AuthController {
    async Login(req, res, next) {
        const user = req.body;

        if (!user.email && !user.Id) {
            return res.status(401).send('Thông tin truyền vào không đầy đủ, Vui lòng kiểm tra lại thông tin.');
        }

        if (!user.email) {
            const users = [
                await accountModel.GetEmailByStudentId(user.Id, undefined),
                await accountModel.GetEmailByLecturersId(user.Id, undefined),
                await accountModel.GetEmailByAdminId(user.Id, undefined),
            ];

            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    user.email = users[i].Email;
                    break;
                }
            }
        }

        const userFromDatabase = await AccountModel.GetAccountByEmail(user.email);
        if (!userFromDatabase) {
            return res.status(401).send('Tên đăng nhập không tồn tại, vui lòng kiểm tra lại.');
        }

        const isPasswordValid = bcrypt.compareSync(user.passWord, userFromDatabase.PassWord);
        if (!isPasswordValid) {
            return res.status(401).send('Mật khẩu không chính xác, vui lòng kiểm tra lại.');
        }

        const userVerify = {
            otp: user.otp,
            email: user.email,
        };

        const isOtpValid = await authMethod.verifyOtp(userVerify);
        if (!isOtpValid) {
            return res.status(401).send('Mã OTP không chính xác, vui lòng thử lại.');
        }
        await OTPModule.DeleteOTP(user.otp);

        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

        const dataForAccessToken = {
            email: user.email,
        };

        //Tạo access tolen
        const accessToken = await authMethod.generateToken(dataForAccessToken, accessTokenSecret, accessTokenLife);
        if (!accessToken) {
            return res.status(401).send('Đăng nhập không thành công, vui lòng thử lại.');
        }

        let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
        if (!userFromDatabase.refreshToken) {
            // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
            await AccountModel.UpdateRefreshToken(user.email, refreshToken);
        } else {
            // Nếu user này đã có refresh token thì lấy refresh token đó từ database
            refreshToken = userFromDatabase.refreshToken;
        }

        return res.json({
            msg: 'Đăng nhập thành công.',
            accessToken,
            refreshToken,
            user,
        });
    }
    async Refresh(req, res, next) {
        // lấy acctoken từ req.header
        const accessTokenFromHeader = req.headers.x_authorization;
        if (!accessTokenFromHeader) {
            return res.status(400).send('Không tim thấy access token');
        }
        // lấy refresh token từ req.body
        const refreshFromBody = req.body.refreshToken;
        if (!refreshFromBody) {
            return res.status(400).send('Không tìm thấy refresh token');
        }

        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        // decode access token
        const decoded = await authMethod.decodeToken(accessTokenFromHeader, accessTokenSecret);
        const user = await AccountModel.GetAccountByEmail(decoded.payload.email);

        if (!user) {
            return res.status(400).send('Không tồn tại user');
        }

        if (user.refreshToken !== refreshFromBody) {
            return res.status(400).send('Refresh token không hợp lệ');
        }

        const dataForAcessToken = {
            email: user.Email,
        };

        const accessToken = await authMethod.generateToken(dataForAcessToken, accessTokenSecret, accessTokenLife);
        if (!accessToken) {
            return res.status(400).send('Tạo không thành công access token, vui lòng thử lại');
        }

        return res.json({
            accessToken,
        });
    }
    async SendOTP(req, res, next) {
        const sengridApiKey = process.env.SENDGRID_API_KEY; // Key sendgrid
        const adminEmailAddress = process.env.ADMIN_EMAIL_ADDRESS; // Địa chỉ eamil gửi thư
        sgMail.setApiKey(sengridApiKey);
        let isRegister = true;

        const NewUser = {
            ...req.body,
            verified: false,
            url_avatar: 'https://khoinguonsangtao.vn/wp-content/uploads/2022/07/avatar-gau-cute.jpg',
        };

        if (!NewUser.Id && !NewUser.email) {
            return res.status(401).send('Thông tin truyền vào không đầy đủ, Vui lòng kiểm tra lại thông tin.');
        }

        // Nếu không có email thì lấy email thông qua id của người dùng
        // Nếu có thì lấy ra email để gửi mã otp và khống cho đăng ký nữa vì đã tồn tại tài khoản
        // Nếu không đã có email thì kiểm tra xem có tài khoản chưa bằng email
        if (!NewUser.email) {
            const users = [
                await accountModel.GetEmailByStudentId(NewUser.Id, undefined),
                await accountModel.GetEmailByLecturersId(NewUser.Id, undefined),
                await accountModel.GetEmailByAdminId(NewUser.Id, undefined),
            ];

            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    NewUser.email = users[i].Email;
                    isRegister = false;
                    break;
                }
            }
        } else {
            const acc = await accountModel.GetAccountByEmail(NewUser.email);
            if (acc) {
                isRegister = false;
            }
        }

        if (isRegister) {
            // kiểm tra người dùng có là đối tượng được phép tạo tài khoản không bằng id
            if (NewUser.typeAccount === '2') {
                const Student = await StudentModel.GetStudentByStudentId(NewUser.Id);
                if (!Student) {
                    return res.status(400).send('Mã sinh viên không đúng, vui lòng kiểm tra lại mã sinh viên');
                }
                NewUser.showName = Student.HoTen;
            }

            if (NewUser.typeAccount === '1') {
                const Lecturers = await LecturersModel.GetStudentLecturersId(NewUser.Id);
                if (!Lecturers) {
                    return res.status(400).send('Mã giảng viên không đúng, vui lòng kiểm tra lại mã giảng viên');
                }
                NewUser.showName = Lecturers.HoTen;
            }

            if (NewUser.typeAccount === '0') {
                const Admin = await AdmiModel.GetStudentAdminId(NewUser.Id);
                if (!Admin) {
                    return res.status(400).send('Mã người quản lý không đúng, vui lòng kiểm tra lại mã người quản lý');
                }
                NewUser.showName = Admin.HoTen;
            }
        }

        const OTP = {
            otp: '',
            creatAt: '',
            expireAt: '',
            email: NewUser.email,
            isUsed: false,
        };

        try {
            const hashPassword = bcrypt.hashSync(NewUser.passWord, 8); //Mã hóa mật khẩu
            NewUser.passWord = hashPassword;
            //kiểm tra trường hợp tài khoản chưa xác minh bằng otp nếu chưa có tài khoản thì thêm vào còn không thì tạo otp
            if (isRegister) {
                await AccountModel.InsertUser(NewUser);
            }

            // tạo và lưu otp vào database
            const creatAt = new Date();
            OTP.creatAt = await authMethod.FormatDate(creatAt);
            creatAt.setSeconds(creatAt.getSeconds() + 30);
            OTP.expireAt = await authMethod.FormatDate(creatAt);
            OTP.otp = await authMethod.generateOtp();

            await OTPModule.InsertOTP(OTP);
            setTimeout(() => {
                OTPModule.DeleteOTP(OTP.otp);
            }, 30000);
        } catch (error) {
            console.log(error);
            return res.status(400).send('Tạo tài khoản không thành công, Vui lòng kiểm tra lại thông tin.');
        }

        // setup gửi otp qua gmail
        const subject = 'Mã OTP đăng ký tài khoản';
        const content = `Đây là mã otp của bạn ${OTP.otp}`;
        const msg = {
            to: NewUser.email,
            from: adminEmailAddress,
            subject: subject,
            text: content,
            html: `<strong>${content}</strong>`,
        };
        sgMail
            .send(msg)
            .then(() => {
                res.status(202).json({ message: 'Email sent successfully.' });
            })
            .catch((error) => {
                res.status(500).json({ errors: error.message });
            });
    }
}

module.exports = new AuthController();
