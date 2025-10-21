require("dotenv").config();
const express = require("express");

const app = express();

// Lấy cấu hình môi trường
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_NAME || "localhost";

// Debug thông tin môi trường
console.log("PORT from .env:", process.env.PORT);
console.log("HOST from .env:", process.env.HOST_NAME);

// Middleware
app.use(express.json());

// Routes
const genreRoutes = require("./src/web/routers/genreRoute");
const songGenreRoutes = require("./src/web/routers/songGenreRouter");
const featureRoutes = require("./src/web/routers/songFeatureRoute");
const songRouter = require("./src/web/routers/songRouter");
const playlistRouter = require("./src/web/routers/playlistRouter");
const favoriteRouter = require("./src/web/routers/favoriteRouter");
const historyRouter = require("./src/web/routers/historyRouter");
const UserTrendProfile = require("./src/web/routers/userTrendProfileRoute")

app.use("/api/genres", genreRoutes);
app.use("/api/song-genres", songGenreRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/songs", songRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/history", historyRouter);
app.use("/api/trend",UserTrendProfile);
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
