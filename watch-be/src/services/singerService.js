const { ulid } = require("ulid");
const SingerRepository = require("../infras/repositories/singerRepository");

const SingerService = {
  async getAllSingers() {
    return await SingerRepository.findAll();
  },

  async getSingerById(singerId) {
    if (!singerId) throw new Error("Singer ID không hợp lệ");
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Không tìm thấy nghệ sĩ");
    return singer;
  },

  // 🟢 Tạo nghệ sĩ mới (CHO PHÉP TRÙNG TÊN)
  async createSinger(data) {
    if (!data.name || !data.name.trim()) throw new Error("Tên nghệ sĩ không được để trống");
    
    const singerId = ulid();
    
    await SingerRepository.create({
      singerId,
      name: data.name.trim(),
      bio: data.bio?.trim() || "",
      imageUrl: data.imageUrl || null,
    });

    return { success: true, message: "Tạo nghệ sĩ thành công", singerId };
  },

  // 🟡 Cập nhật
  async updateSinger(singerId, data) {
    const currentSinger = await SingerRepository.findById(singerId);
    if (!currentSinger) throw new Error("Không tìm thấy nghệ sĩ");

    const updateData = {};
    if (data.name && data.name.trim()) updateData.name = data.name.trim();
    if (data.bio !== undefined) updateData.bio = data.bio.trim();
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    if (Object.keys(updateData).length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const success = await SingerRepository.update(singerId, updateData);
    if (!success) throw new Error("Cập nhật thất bại");

    return { success: true, message: "Cập nhật nghệ sĩ thành công" };
  },

  // 🔴 Xóa nghệ sĩ (CÓ KIỂM TRA RÀNG BUỘC)
  async deleteSinger(singerId) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Không tìm thấy nghệ sĩ");

    // 1. Kiểm tra ràng buộc: Nghệ sĩ có bài hát không?
    const hasSongs = await SingerRepository.hasSongs(singerId);
    if (hasSongs) {
      throw new Error(`Không thể xóa '${singer.name}' vì đang có bài hát trong hệ thống.`);
    }

    // 2. Xóa
    const success = await SingerRepository.delete(singerId);
    if (!success) throw new Error("Xóa nghệ sĩ thất bại");

    return { success: true, message: "Xóa nghệ sĩ thành công" };
  },

  async searchSingers(keyword) {
    if (!keyword || !keyword.trim()) return await this.getAllSingers();
    return await SingerRepository.searchByName(keyword.trim());
  },
};

module.exports = SingerService;