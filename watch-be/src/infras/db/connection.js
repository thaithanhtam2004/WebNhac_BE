const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00", // ✅ THÊM: Timezone Việt Nam (UTC+7)
  dateStrings: true, // ✅ THÊM: Trả về date dạng string, không convert
});

// Kiểm tra kết nối với pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected via pool");
  connection.release();
});

module.exports = pool;
