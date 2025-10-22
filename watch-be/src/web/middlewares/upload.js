const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // Giới hạn 200MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép upload audio, video, image
    if (
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("❌ Chỉ cho phép upload file nhạc hoặc ảnh!"), false);
    }
  },
});

module.exports = upload;
