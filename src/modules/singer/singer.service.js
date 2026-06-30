const { ulid } = require("ulid");
const SingerRepository = require("./singer.repository");

const SingerService = {
  async getAllSingers() {
    return await SingerRepository.findAll();
  },

  async getAllSingersPaginated(params) {
    return await SingerRepository.findAllPaginated(params);
  },

  async getSingerById(singerId) {
    if (!singerId) throw new Error("Singer ID không hợp lệ");
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Không tìm thấy nghệ sĩ");
    return singer;
  },

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

  async deleteSinger(singerId) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Không tìm thấy nghệ sĩ");

    const hasSongs = await SingerRepository.hasSongs(singerId);
    if (hasSongs) {
      throw new Error(`Không thể xóa '${singer.name}' vì đang có bài hát trong hệ thống.`);
    }

    const success = await SingerRepository.delete(singerId);
    if (!success) throw new Error("Xóa nghệ sĩ thất bại");

    return { success: true, message: "Xóa nghệ sĩ thành công" };
  },

  async toggleVisibility(singerId) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Không tìm thấy nghệ sĩ");

    const success = await SingerRepository.update(singerId, { isHidden: !singer.isHidden });
    if (!success) throw new Error("Cập nhật trạng thái thất bại");

    return { success: true, message: "Cập nhật trạng thái thành công" };
  },

  async bulkDelete(singerIds) {
    if (!singerIds || singerIds.length === 0) throw new Error("Danh sách ID rỗng");
    
    // Check constraint for all
    let cannotDelete = [];
    for (const id of singerIds) {
      const hasSongs = await SingerRepository.hasSongs(id);
      if (hasSongs) cannotDelete.push(id);
    }
    if (cannotDelete.length > 0) {
      throw new Error(`Không thể xóa ${cannotDelete.length} nghệ sĩ vì đang có bài hát liên kết.`);
    }

    const count = await SingerRepository.bulkDelete(singerIds);
    return { success: true, message: `Đã xóa ${count} nghệ sĩ thành công` };
  },

  async bulkToggleVisibility(singerIds) {
    if (!singerIds || singerIds.length === 0) throw new Error("Danh sách ID rỗng");
    const count = await SingerRepository.bulkToggleVisibility(singerIds);
    return { success: true, message: `Đã cập nhật trạng thái ${count} nghệ sĩ` };
  },

  async searchSingers(keyword) {
    if (!keyword || !keyword.trim()) return await this.getAllSingers();
    return await SingerRepository.searchByName(keyword.trim());
  },
};

module.exports = SingerService;
