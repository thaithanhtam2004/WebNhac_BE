const { ulid } = require("ulid");
const SingerRepository = require("../infras/repositories/singerRepository");

const SingerService = {
  async getAllSingers() {
    return await SingerRepository.findAll();
  },

  async getSingerById(singerId) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");
    return singer;
  },

  async createSinger(data) {
    const singerId = ulid();
    // đảm bảo imageUrl có giá trị null nếu FE gửi undefined
    const singerData = {
      ...data,
      singerId,
      imageUrl: data.imageUrl || null, // đảm bảo null nếu undefined
      bio: data.bio || "", // tránh undefined
      country: data.country || "", // nếu có country
    };

    await SingerRepository.create(singerData);
    return { message: "Tạo ca sĩ thành công", singerId };
  },

  async updateSinger(singerId, data) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    // map data, avatar null vẫn ok
    const updateData = {
      ...data,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : singer.imageUrl,
    };

    const success = await SingerRepository.update(singerId, updateData);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật ca sĩ thành công" };
  },

  async deleteSinger(singerId) {
    const success = await SingerRepository.delete(singerId);
    if (!success) throw new Error("Xóa thất bại (ca sĩ không tồn tại)");

    return { message: "Đã xóa ca sĩ thành công" };
  },
};

module.exports = SingerService;
