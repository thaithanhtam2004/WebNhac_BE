// src/middlewares/viewLimiter.js
const viewHistory = new Map();

// 30 seconds cooldown between views from the same IP for the same song
const COOLDOWN_MS = 30000; 

// Clean up memory cache every 5 minutes to prevent leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewHistory.entries()) {
    if (now - timestamp > COOLDOWN_MS) {
      viewHistory.delete(key);
    }
  }
}, 300000);

const viewLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const songId = req.params.id;
  
  if (!songId) {
    return next();
  }

  const key = `${ip}:${songId}`;
  const now = Date.now();
  const lastViewTime = viewHistory.get(key);

  if (lastViewTime && now - lastViewTime < COOLDOWN_MS) {
    // Silently succeed but do not increment in DB to prevent spam
    console.log(`[RateLimit] Blocked view spam for song: ${songId} from IP: ${ip}`);
    return res.status(200).json({ 
      success: true, 
      message: "Lượt nghe đã được ghi nhận trước đó" 
    });
  }

  // Update last view time
  viewHistory.set(key, now);
  next();
};

module.exports = viewLimiter;
