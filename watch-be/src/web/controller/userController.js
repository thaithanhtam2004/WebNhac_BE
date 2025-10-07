import { userService } from "../../services/userService.js";

export const userController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
