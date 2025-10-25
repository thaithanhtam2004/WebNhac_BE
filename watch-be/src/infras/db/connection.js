const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Số connection tối đa trong pool
  queueLimit: 0,
  timezone: "+07:00", // ✅ Thêm: Timezone Việt Nam (UTC+7)
  dateStrings: true,   // ✅ Thêm: Trả về date dạng string, không convert
});

// Kiểm tra kết nối với pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected via pool");
  connection.release(); // Trả connection về pool sau khi dùng
});

module.exports = pool;
