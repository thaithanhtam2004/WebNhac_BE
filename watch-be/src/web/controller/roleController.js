const RoleService = require("../../services/roleService");

class RoleController {
  async getAll(req, res) {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      res.status(200).json({ success: true, data: role });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const currentUser = req.user;
      const result = await RoleService.createRole(req.body, currentUser);
      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const currentUser = req.user;
      const result = await RoleService.updateRole(req.params.id, req.body, currentUser);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const currentUser = req.user;
      const result = await RoleService.deleteRole(req.params.id, currentUser);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new RoleController();
