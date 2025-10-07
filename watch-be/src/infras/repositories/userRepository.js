import { db } from "../db/connection.js";
import { User } from "../../domains/entities/User.js";

export const userRepository = {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM users");
    return rows.map((row) => new User(row));
  },

  async getById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows.length ? new User(rows[0]) : null;
  },
};
