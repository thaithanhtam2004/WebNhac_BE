const { ulid } = require("ulid");
const AlbumRepository = require("../infras/repositories/albumRepository");
const SingerRepository = require("../infras/repositories/singerRepository");

const AlbumService = {
  async getAllAlbums() {
    return await AlbumRepository.findAll();
  },

  async getAlbumById(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");
    return album;
  },

  async createAlbum(data) {
    // check singer tồn tại
    const singer = await SingerRepository.findById(data.singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    const albumId = ulid();
    await AlbumRepository.create({ ...data, albumId });

    return { message: "Tạo album thành công", albumId };
  },

  async updateAlbum(albumId, data) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    if (data.singerId) {
      const singer = await SingerRepository.findById(data.singerId);
      if (!singer) throw new Error("Ca sĩ không tồn tại");
    }

    const success = await AlbumRepository.update(albumId, data);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật album thành công" };
  },

  async deleteAlbum(albumId) {
    const success = await AlbumRepository.delete(albumId);
    if (!success) throw new Error("Xóa thất bại (album không tồn tại)");

    return { message: "Đã xóa album thành công" };
  },
};

module.exports = AlbumService;
