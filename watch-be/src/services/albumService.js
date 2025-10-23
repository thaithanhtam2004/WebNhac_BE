const { ulid } = require("ulid");
const cloudinary = require("../utils/config/cloudinary");
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

  async getAlbumsBySinger(singerId) {
    const albums = await AlbumRepository.findBySingerId(singerId);
    return albums;
  },

  async createAlbum(data, file) {
    if (!data.name) throw new Error("Tên album không được để trống");
    const singer = await SingerRepository.findById(data.singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    // 🖼 Upload ảnh lên Cloudinary (nếu có)
    let coverUrl = data.coverUrl || null;
    if (file) {
      const base64 = file.buffer.toString("base64");
      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64}`,
        { folder: "albums", resource_type: "image" }
      );
      coverUrl = uploadRes.secure_url;
    }

    const albumId = ulid();
    await AlbumRepository.create({ ...data, albumId, coverUrl });

    return { message: "Tạo album thành công", albumId };
  },

  async updateAlbum(albumId, data, file) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    if (data.singerId) {
      const singer = await SingerRepository.findById(data.singerId);
      if (!singer) throw new Error("Ca sĩ không tồn tại");
    }

    if (file) {
      const base64 = file.buffer.toString("base64");
      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64}`,
        { folder: "albums", resource_type: "image" }
      );
      data.coverUrl = uploadRes.secure_url;
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
