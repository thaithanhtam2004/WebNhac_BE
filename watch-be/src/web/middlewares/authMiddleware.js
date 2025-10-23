const jwt = require("jsonwebtoken");
const UserRepository = require("../../infras/repositories/userRepository");
const RoleRepository = require("../../infras/repositories/roleRepository");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ DB
    const user = await UserRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa" });
    }

    // Lấy role (nếu cần)
    if (user.roleId) {
      const role = await RoleRepository.findById(user.roleId);
      user.roleName = role ? role.roleName : null;
    }

    req.user = user; // attach user vào request
    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    res.status(401).json({ success: false, message: "Xác thực thất bại" });
  }
};

module.exports = authMiddleware;
