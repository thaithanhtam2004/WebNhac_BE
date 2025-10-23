const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");

// 🟢 Đăng ký người dùng mới
router.post("/register", UserController.register);

// 🟢 Đăng nhập
router.post("/login", UserController.login);

// 🟢 Quên mật khẩu (gửi OTP)
router.post("/forgot-password", UserController.forgotPassword);

// 🟢 Reset mật khẩu (xác minh OTP)
router.post("/reset-password", UserController.resetPassword);

// 🟢 Lấy danh sách tất cả người dùng
router.get("/", UserController.getAll);

// 🟢 Lấy thông tin người dùng theo ID
router.get("/:id", UserController.getById);

// 🟢 Đổi mật khẩu
router.put("/:id/change-password", UserController.changePassword);

// 🟢 Vô hiệu hóa (disable) người dùng
router.delete("/:id", UserController.disable);

module.exports = router;
