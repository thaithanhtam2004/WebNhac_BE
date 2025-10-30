// singerService.js
const { ulid } = require("ulid");
const SingerRepository = require("../infras/repositories/singerRepository");

const SingerService = {
  /**
   * Lấy danh sách tất cả nghệ sĩ
   */
  async getAllSingers() {
    try {
      return await SingerRepository.findAll();
    } catch (error) {
      throw new Error(`Không thể lấy danh sách nghệ sĩ: ${error.message}`);
    }
  },

  /**
   * Lấy thông tin nghệ sĩ theo ID
   */
  async getSingerById(singerId) {
    if (!singerId) {
      throw new Error("Singer ID không hợp lệ");
    }

    const singer = await SingerRepository.findById(singerId);
    if (!singer) {
      throw new Error("Không tìm thấy nghệ sĩ");
    }

    return singer;
  },

  /**
   * Tạo nghệ sĩ mới
   */
  async createSinger(data) {
    // Validation
    if (!data.name || !data.name.trim()) {
      throw new Error("Tên nghệ sĩ không được để trống");
    }

    // Tạo ID mới
    const singerId = ulid();

    // Chuẩn bị dữ liệu
    const singerData = {
      singerId,
      name: data.name.trim(),
      bio: data.bio?.trim() || "",
      imageUrl: data.imageUrl || null,
    };

    // Lưu vào database
    await SingerRepository.create(singerData);

    return {
      success: true,
      message: "Tạo nghệ sĩ thành công",
      data: { singerId },
    };
  },

  /**
   * Cập nhật thông tin nghệ sĩ
   */
  async updateSinger(singerId, data) {
    // Kiểm tra nghệ sĩ có tồn tại không
    const exists = await SingerRepository.exists(singerId);
    if (!exists) {
      throw new Error("Không tìm thấy nghệ sĩ");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};

    if (data.name !== undefined && data.name.trim()) {
      updateData.name = data.name.trim();
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio.trim();
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    // Kiểm tra có dữ liệu để update không
    if (Object.keys(updateData).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    // Thực hiện update
    const success = await SingerRepository.update(singerId, updateData);
    if (!success) {
      throw new Error("Cập nhật thất bại");
    }

    return {
      success: true,
      message: "Cập nhật nghệ sĩ thành công",
    };
  },

  /**
   * Xóa nghệ sĩ
   */
  async deleteSinger(singerId) {
    // Kiểm tra nghệ sĩ có tồn tại không
    const exists = await SingerRepository.exists(singerId);
    if (!exists) {
      throw new Error("Không tìm thấy nghệ sĩ");
    }

    // Thực hiện xóa
    const success = await SingerRepository.delete(singerId);
    if (!success) {
      throw new Error("Xóa nghệ sĩ thất bại");
    }

    return {
      success: true,
      message: "Xóa nghệ sĩ thành công",
    };
  },

  /**
   * Tìm kiếm nghệ sĩ theo tên
   */
  async searchSingers(keyword) {
    if (!keyword || !keyword.trim()) {
      return await this.getAllSingers();
    }

    return await SingerRepository.searchByName(keyword.trim());
  },
};

module.exports = SingerService;