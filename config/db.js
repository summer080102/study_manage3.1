const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'studyapp2',
    password: process.env.DB_PASSWORD || 'qwertyuiop',
    database: process.env.DB_NAME || 'study_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}).promise();

console.log("db == ", db);
console.log("db.pool._closed == ", db.pool._closed);

module.exports = db;