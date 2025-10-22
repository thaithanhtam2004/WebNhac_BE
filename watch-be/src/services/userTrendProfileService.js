const { ulid } = require("ulid");
const bcrypt = require("bcrypt");
const UserRepository = require("../infras/repositories/userRepository");
const RoleRepository = require("../infras/repositories/roleRepository");

// Hàm validate đơn giản
const isEmailValid = (email) => /^\S+@\S+\.\S+$/.test(email);
const isPhoneValid = (phone) => /^\+?\d{7,15}$/.test(phone);

const UserService = {
  async getAllUsers() {
    return await UserRepository.findAll();
  },

  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  },

  async createUser(data, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được tạo người dùng");

    if (!isEmailValid(data.email)) throw new Error("Email không hợp lệ");
    if (!isPhoneValid(data.phone)) throw new Error("Số điện thoại không hợp lệ");

    // Check role tồn tại
    const role = await RoleRepository.findById(data.roleId);
    if (!role) throw new Error("Role không tồn tại");

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userId = ulid();
    await UserRepository.create({
      ...data,
      userId,
      password: hashedPassword,
    });

    return { message: "Tạo người dùng thành công", userId };
  },

  async updateUser(userId, data, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được cập nhật người dùng");

    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    if (data.email && !isEmailValid(data.email)) throw new Error("Email không hợp lệ");
    if (data.phone && !isPhoneValid(data.phone)) throw new Error("Số điện thoại không hợp lệ");

    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    const success = await UserRepository.update(userId, data);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật người dùng thành công" };
  },

  async deleteUser(userId, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được xóa người dùng");

    const success = await UserRepository.delete(userId);
    if (!success) throw new Error("Xóa thất bại (người dùng không tồn tại)");

    return { message: "Đã xóa người dùng thành công" };
  },
};

module.exports = UserService;
