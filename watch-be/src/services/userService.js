const UserRepository = require("../infras/repositories/userRepository");
const bcrypt = require("bcrypt");
// const authService = require("../utils/jwt");

const UserService = {
  // 🟢 Đăng ký tài khoản mới
  async register({ name, email, phone, password, role_id }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new Error("Email đã tồn tại");

    await UserRepository.create({
      name,
      email,
      phone,
      password,
      role_id,
    });

    return { message: "Đăng ký thành công" };
  },

  // 🟢 Đăng nhập
  async login({ email, password }) {
    const user = await UserRepository.findUserWithPassword(email);
    if (!user) throw new Error("Không tìm thấy email");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai mật khẩu");

    return {
      message: "Đăng nhập thành công",
      user: {
        user_id: user.user_id,
        name: user.name,
        role_id: user.role_id,
        email: user.email,
      },
      token: authService.taoToken({
        id: user.user_id,
        role_id: user.role_id,
        name: user.name,
        email: user.email,
      }),
    };
  },

  // 🟢 Lấy thông tin người dùng theo ID
  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error("Không tìm thấy người dùng");
    return user;
  },

  // 🟢 Cập nhật thông tin người dùng
  async updateUser(id, newData) {
    const success = await UserRepository.update(id, newData);
    if (!success) throw new Error("Cập nhật thất bại");
    return { message: "Cập nhật thành công" };
  },

  // 🟢 Đổi mật khẩu
  async changePassword(user_id, oldPassword, newPassword) {
    const user = await UserRepository.findUserWithPasswordById(user_id);
    if (!user) throw new Error("Không tìm thấy tài khoản");

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new Error("Mật khẩu cũ không đúng");

    const success = await UserRepository.changePassword(user_id, newPassword);
    if (!success) throw new Error("Đổi mật khẩu thất bại");

    return { message: "Đổi mật khẩu thành công" };
  },

  // 🟢 Xóa hoặc vô hiệu hóa tài khoản
  async deleteUser(user_id) {
    const success = await UserRepository.delete(user_id, { softDelete: true });
    if (!success) throw new Error("Xóa thất bại");
    return { message: "Xóa thành công" };
  },

  // 🟢 Lấy tất cả người dùng
  async getAllUsers() {
    const list = await UserRepository.findAll();
    return list;
  },
};

module.exports = UserService;
