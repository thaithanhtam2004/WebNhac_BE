const express = require("express");
const router = express.Router();
const RoleController = require("../controller/roleController");
const authMiddleware = require("../middlewares/authMiddleware");

// Middleware xác thực
router.use(authMiddleware);

// 🟢 Lấy danh sách role
router.get("/", RoleController.getAll);

// 🟢 Lấy role theo ID
router.get("/:id", RoleController.getById);

// 🟢 Tạo role mới
router.post("/", RoleController.create);

// 🟢 Cập nhật role
router.put("/:id", RoleController.update);

// 🟢 Xóa role
router.delete("/:id", RoleController.delete);

module.exports = router;
