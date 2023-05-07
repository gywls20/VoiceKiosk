const mysql = require('mysql');
require('dotenv').config();

const dbInfo = {
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    socketPath: process.env.socketPath
};

const connection = mysql.createPool(dbInfo);

module.exports = {
    connection
};