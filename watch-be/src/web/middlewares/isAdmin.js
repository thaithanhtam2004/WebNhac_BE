const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Chưa xác thực người dùng",
    });
  }

  // Check theo roleName (ổn định – đúng chuẩn)
  if (req.user.roleName !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập (Admin only)",
    });
  }

  next();
};

module.exports = isAdmin;
