require("dotenv").config();
const express = require("express");

const app = express();

// Debug thông tin môi trường
console.log("PORT from .env:", process.env.PORT);
console.log("HOST from .env:", process.env.HOST_NAME);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_NAME || "localhost";

// Middleware
app.use(express.json());

const userRoutes = require("./src/web/routers/userRouter");
app.use("/api/users", userRoutes);

const genreRoutes = require("./src/web/routers/genreRoute");
app.use("/api/genres", genreRoutes);

// const songGenreRoutes = require("./src/web/routers/songGenreRouter");
// app.use("/api/song-genres", songGenreRoutes);

// const albumSongRoutes = require("./src/web/routers/albumSongRoute")
// app.use("/api/albumSongs", albumSongRoutes);

const featureRoutes = require("./src/web/routers/songFeatureRoute");
app.use("/api/features", featureRoutes);

// Route kiểm tra API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "User, Genre & Feature API đang hoạt động!",
  });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ nội bộ",
  });
});

// Khởi động server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server đang chạy tại: http://${HOST}:${PORT}`);
});
