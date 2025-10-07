import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
};
