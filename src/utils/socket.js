const socketio = require("socket.io");
const UserRecommendationService = require("../modules/recommendation/recommendation.service");

function initSocket(server) {
  const io = socketio(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("register", ({ userId }) => {
      socket.join(`user:${userId}`);
      socket.userId = userId;
      console.log(`✅ User ${userId} joined room`);
    });

    // Khi user play bài hát
    socket.on("track_played", async ({ userId, songId }) => {
      console.log(`🎧 ${userId} played ${songId}`);
      try {
        const recs = await UserRecommendationService.generateRecommendationsForUser(userId);

        // Emit realtime về client
        io.to(`user:${userId}`).emit("recommendations", {
          userId,
          recommendations: recs,
        });

        console.log(`✅ Recommendations sent for ${userId}`);
      } catch (err) {
        console.error("❌ Realtime recommendation error:", err);
        socket.emit("error", { message: "Không lấy được gợi ý" });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
