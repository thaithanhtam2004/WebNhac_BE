import { userRepository } from "../infras/repositories/userRepository.js";

export const userService = {
  async getAllUsers() {
    return await userRepository.getAll();
  },
  async getUserById(id) {
    return await userRepository.getById(id);
  },
};
