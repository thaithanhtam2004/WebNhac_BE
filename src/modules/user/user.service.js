const bcrypt = require("bcrypt");
const { ulid } = require("ulid");
const UserRepository = require("./user.repository");

const UserService = {
  async getAllUsers() { return await UserRepository.findAll(); },

  async getAllUsersPaginated(params) {
    return await UserRepository.findAllPaginated(params);
  },

  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  },

  async register(data) {
    const { name, email, phone, password, roleId } = data;
    if (!name || !email || !password) throw new Error("Thiếu thông tin bắt buộc");
    
    const exists = await UserRepository.existsByEmail(email);
    if (exists) throw new Error("Email đã được sử dụng");

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = ulid();

    const USER_ROLE_ID = 1;

    await UserRepository.create({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: roleId || USER_ROLE_ID,
      isActive: 1,
    });

    return {
      message: "Đăng ký thành công",
      userId,
      role: "USER",
    };
  },
  
  async login({ email, password }) {
    const user = await UserRepository.findByEmailWithRole(email);
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Email hoặc mật khẩu không đúng");
    
    if (!user.isActive) throw new Error("Tài khoản đã bị khóa");

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async updateUser(userId, data) {
    const success = await UserRepository.update(userId, data);
    if (!success) throw new Error("Cập nhật thất bại hoặc không có gì thay đổi");
    return { message: "Cập nhật thành công" };
  },

  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error("Mật khẩu cũ không đúng");

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hashed);
    return { message: "Đổi mật khẩu thành công" };
  },

  async toggleUserStatus(userId, isActive) {
    const success = await UserRepository.updateStatus(userId, isActive);
    if (!success) throw new Error("Người dùng không tồn tại");
    return { message: isActive ? "Đã mở khóa người dùng" : "Đã khóa người dùng" };
  },

  async bulkUpdateStatus(userIds, isActive) {
    if (!userIds || userIds.length === 0) throw new Error("Danh sách ID rỗng");
    const count = await UserRepository.bulkUpdateStatus(userIds, isActive);
    return { success: true, message: `Đã ${isActive ? 'mở khóa' : 'khóa'} ${count} người dùng` };
  },
  
  async deleteUser(userId) {
    const success = await UserRepository.delete(userId);
    if (!success) throw new Error("Xóa người dùng thất bại");
    return { message: "Xóa người dùng thành công" };
  },

  async bulkDelete(userIds) {
    if (!userIds || userIds.length === 0) throw new Error("Danh sách ID rỗng");
    const count = await UserRepository.bulkDelete(userIds);
    return { success: true, message: `Đã xóa ${count} người dùng thành công` };
  },
};

module.exports = UserService;
