import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { userRouter } from "./src/web/routers/userRouter.js";
import { errorHandler } from "./src/web/middlewares/errorHandler.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routers
app.use("/api/users", userRouter);

// Middleware xử lý lỗi
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
