const express = require("express");
const router = express.Router();

const UserController = require("../controller/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

// ==================
// 🌍 PUBLIC ROUTES
// ==================
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// ==================
// 🔒 ADMIN ONLY
// ==================

// Lấy danh sách user (trang quản lý)
router.get("/", authMiddleware, isAdmin, UserController.getAll);

// Khóa / mở user
router.patch(
  "/:id/status",
  authMiddleware,
  isAdmin,
  UserController.updateStatus
);
router.delete("/:id", authMiddleware, isAdmin, UserController.disable);
router.patch("/:id/enable", authMiddleware, isAdmin, UserController.enable);

// ==================
// 🔐 USER ĐÃ ĐĂNG NHẬP
// ==================

// Lấy thông tin user
router.get("/:id", authMiddleware, UserController.getById);

// Cập nhật thông tin
router.put("/:id", authMiddleware, UserController.update);

// Đổi mật khẩu
router.put(
  "/:id/change-password",
  authMiddleware,
  UserController.changePassword
);

module.exports = router;
