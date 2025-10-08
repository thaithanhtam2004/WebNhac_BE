require("dotenv").config();
const express = require("express");
// const cors = require("./utils/config/cors.config");

const app = express();

// 🔍 Debug thông tin môi trường
console.log("✅ PORT from .env:", process.env.PORT);
console.log("✅ HOST from .env:", process.env.HOST_NAME);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_NAME || "localhost";

// 🧩 Middleware
app.use(express.json());


// 🧠 Routes
const userRoutes = require("./src/web/routers/userRouter");
app.use("/api/users", userRoutes);

// 🏠 Route kiểm tra API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 User API đang hoạt động!",
  });
});

// 🧯 Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ nội bộ",
  });
});

// 🚀 Khởi động server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server đang chạy tại: http://${HOST}:${PORT}`);
});
