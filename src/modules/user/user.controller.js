const jwt = require("jsonwebtoken");
const UserService = require("./user.service");

class UserController {
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
        { userId: user.userId, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: { ...user, token, roleName: user.roleName },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, sortBy, sortOrder, order, status } = req.query;
      if (page || limit || search || status) {
        const result = await UserService.getAllUsersPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || "",
          sortBy: sortBy || "createdAt",
          sortOrder: order || sortOrder || "desc",
          status: status || "all",
        });
        return res.status(200).json({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      }
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

  async updateStatus(req, res) {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: "isActive phải là boolean" });
      const result = await UserService.toggleUserStatus(req.params.id, isActive);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }
  
  async bulkUpdateStatus(req, res) {
    try {
      const { userIds, isActive } = req.body;
      if (!userIds || !Array.isArray(userIds) || typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "Tham số không hợp lệ" });
      }
      const response = await UserService.bulkUpdateStatus(userIds, isActive);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { userIds } = req.body;
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: "Thiếu danh sách userIds" });
      }
      const response = await UserService.bulkDelete(userIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
