const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const con = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_SEVER_NAME,
    password: process.env.DATABSE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: 3306,
});
module.exports = con;
