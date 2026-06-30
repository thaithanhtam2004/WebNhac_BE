const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || process.env.DB_PASS || "123456",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  timezone: "+07:00",
  dateStrings: true,
});

// Kiểm tra kết nối với pool (có retry để đợi MySQL khởi động trong Docker)
const maxRetries = 5;
const retryInterval = 3000; // 3 giây

function testConnection(attempt = 1) {
  pool.getConnection((err, connection) => {
    if (err) {
      if (attempt <= maxRetries) {
        console.warn(`⚠️ [Database] Không thể kết nối (Lần thử ${attempt}/${maxRetries}). Thử lại sau ${retryInterval / 1000}s...`);
        setTimeout(() => testConnection(attempt + 1), retryInterval);
      } else {
        console.error("❌ [Database] Kết nối CSDL thất bại vĩnh viễn:", err.message);
      }
      return;
    }
    console.log("✅ [Database] Kết nối thành công tới MySQL via pool");
    connection.release();
  });
}

testConnection();

module.exports = pool;
