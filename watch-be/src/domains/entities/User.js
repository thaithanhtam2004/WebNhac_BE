// entities/User.js
class User {
  constructor({ userId, name, email, phone, password, roleId, isActive = true, createdAt }) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.roleId = roleId;
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
  }

  // Trả về object không có password
  toSafeObject() {
    const { password, ...safeData } = this;
    return safeData;
  }
}

module.exports = User;