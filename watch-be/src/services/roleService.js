const { ulid } = require("ulid");
const RoleRepository = require("../infras/repositories/roleRepository");

const RoleService = {
  async getAllRoles() {
    return await RoleRepository.findAll();
  },

  async getRoleById(roleId) {
    const role = await RoleRepository.findById(roleId);
    if (!role) throw new Error("Role không tồn tại");
    return role;
  },

  async createRole(data, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được tạo role");

    const exist = await RoleRepository.findByName(data.roleName);
    if (exist) throw new Error("RoleName đã tồn tại");

    const roleId = ulid();
    await RoleRepository.create({ ...data, roleId });

    return { message: "Tạo role thành công", roleId };
  },

  async updateRole(roleId, data, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được cập nhật role");

    const role = await RoleRepository.findById(roleId);
    if (!role) throw new Error("Role không tồn tại");

    if (data.roleName) {
      const exist = await RoleRepository.findByName(data.roleName);
      if (exist && exist.roleId !== roleId) throw new Error("RoleName đã tồn tại");
    }

    const success = await RoleRepository.update(roleId, data);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật role thành công" };
  },

  async deleteRole(roleId, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin")
      throw new Error("Chỉ admin mới được xóa role");

    const success = await RoleRepository.delete(roleId);
    if (!success) throw new Error("Xóa thất bại (role không tồn tại)");

    return { message: "Đã xóa role thành công" };
  },
};

module.exports = RoleService;
