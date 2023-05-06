const mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12616336',
    password: '37GUb1yW6D',
    database: 'sql12616336',
});
module.exports = con;
