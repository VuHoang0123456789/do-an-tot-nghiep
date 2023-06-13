const accountRouter = require('./account');
const studentRouter = require('./student');
const authRouter = require('../auth/routes');
const lecturersRouter = require('./lecturers');
const adminRouter = require('./admin');

function route(app) {
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/account', accountRouter);
    app.use('/student', studentRouter);
    app.use('/lecturers', lecturersRouter);
}
module.exports = route;
