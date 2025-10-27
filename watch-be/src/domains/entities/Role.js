export class Role {
  constructor({ roleId, roleName, description, createdAt }) {
    this.roleId = roleId;
    this.roleName = roleName;
    this.description = description;
    this.createdAt = createdAt || new Date();
  }
}
