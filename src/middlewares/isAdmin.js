const isAdmin = (req, res, next) => {
  if (!req.user || String(req.user.roleId) !== "2") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập (Admin only)",
    });
  }
  next();
};

module.exports = isAdmin;
