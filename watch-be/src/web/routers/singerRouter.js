const express = require("express");
const router = express.Router();
const SingerController = require("../controller/singerController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// 🟢 Lấy danh sách ca sĩ
router.get("/", SingerController.getAll);

// 🟢 Lấy ca sĩ theo ID
router.get("/:id", SingerController.getById);

// 🟢 Tạo ca sĩ mới
router.post("/", SingerController.create);

// 🟢 Cập nhật ca sĩ
router.put("/:id", SingerController.update);

// 🟢 Xóa ca sĩ
router.delete("/:id", SingerController.delete);

module.exports = router;
