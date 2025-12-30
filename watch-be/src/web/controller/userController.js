const jwt = require("jsonwebtoken");
const UserService = require("../../services/userService");

class UserController {
  // Auth & CRUD cơ bản
  async register(req, res) {
    try {
      const result = await UserService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }
  async login(req, res) {
    try {
      const user = await UserService.login(req.body);

      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          roleId: user.roleId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          ...user,
          token,
          roleName: user.roleName, // ✅ QUAN TRỌNG
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }

  async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) { res.status(404).json({ success: false, message: err.message }); }
  }

  async update(req, res) {
    try {
      const result = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }

  async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.params.id, req.body);
      res.status(200).json({ success: true, ...result });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }

  // ==================== CÁC HÀM XỬ LÝ TRẠNG THÁI ====================

  // 1️⃣ Toggle (Dùng cho Frontend Switch)
  async updateStatus(req, res) {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: "isActive phải là boolean" });
      
      const result = await UserService.toggleUserStatus(req.params.id, isActive);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }

  // 2️⃣ Vô hiệu hóa (Map với DELETE method - Soft Delete)
  async disable(req, res) {
    try {
      await UserService.toggleUserStatus(req.params.id, false); // False = Khóa
      res.status(200).json({ success: true, message: "Đã vô hiệu hóa người dùng" });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }

  // 3️⃣ Kích hoạt lại (Map với PATCH /enable)
  async enable(req, res) {
    try {
      const { isActive } = req.body;
      const userId = req.params.id;

      if (isActive === undefined || isActive === null) {
        return res
          .status(400)
          .json({ success: false, message: "isActive là bắt buộc" });
      }

      let result;
      if (isActive === false) {
        result = await UserService.disableUser(userId);
      } else if (isActive === true) {
        result = await UserService.enableUser(userId);
      } else {
        return res.status(400).json({
          success: false,
          message: "isActive phải là true hoặc false",
        });
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new UserController();