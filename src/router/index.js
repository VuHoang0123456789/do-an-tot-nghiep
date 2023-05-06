const accountRouter = require('./account');
const studentRouter = require('./student');
const authRouter = require('../auth/routes');
const lecturersRouter = require('./lecturers');

function route(app) {
    app.use('/auth', authRouter);
    app.use('/account', accountRouter);
    app.use('/student', studentRouter);
    app.use('/lecturers', lecturersRouter);
}
module.exports = route;
