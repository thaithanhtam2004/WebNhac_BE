// middlewares/upload.js
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      // Accept audio files
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file audio!"), false);
      }
    } else if (file.fieldname === "cover") {
      // Accept image files
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file ảnh!"), false);
      }
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload;