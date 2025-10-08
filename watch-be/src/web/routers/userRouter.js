const express = require("express");
const router = express.Router();

const UserController = require("../controller/userController");

// 🟢 Đăng ký người dùng mới
router.post("/register", UserController.register);

// 🟢 Đăng nhập
router.post("/login", UserController.login);

// 🟢 Lấy danh sách tất cả người dùng
router.get("/", UserController.getAllUsers);

// 🟢 Lấy thông tin người dùng theo ID
router.get("/:id", UserController.getUser);

// 🟢 Cập nhật thông tin người dùng
router.put("/:id", UserController.updateUser);

// 🟢 Đổi mật khẩu
router.put("/change-password", UserController.changePassword);

// 🟢 Xóa hoặc vô hiệu hóa người dùng
router.delete("/:id", UserController.deleteUser);

module.exports = router;
