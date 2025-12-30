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
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");
    return await AlbumRepository.findBySingerId(singerId);
  },

  // Helper upload ảnh
  async uploadCover(file) {
    if (!file) return null;
    try {
      const base64 = file.buffer.toString("base64");
      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64}`,
        { folder: "albums", resource_type: "image" }
      );
      return uploadRes.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
      throw new Error("Lỗi upload ảnh bìa");
    }
  },

  // 🟢 Tạo Album (Có validate trùng lặp)
  async createAlbum(data, file) {
    if (!data.name?.trim()) throw new Error("Tên album không được để trống");
    if (!data.singerId) throw new Error("Vui lòng chọn ca sĩ");

    const cleanName = data.name.trim();

    // 1. Kiểm tra Ca sĩ tồn tại
    const singer = await SingerRepository.findById(data.singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    // 2. Kiểm tra Trùng lặp (Tên album + Ca sĩ)
    const isDuplicate = await AlbumRepository.checkDuplicate(cleanName, data.singerId);
    if (isDuplicate) {
      throw new Error(`Ca sĩ này đã có album tên '${cleanName}'.`);
    }

    const coverUrl = await this.uploadCover(file);
    const albumId = ulid();

    await AlbumRepository.create({
      albumId,
      name: cleanName,
      singerId: data.singerId,
      coverUrl,
      description: data.description || null,
      totalViews: 0,
      releaseDate: data.releaseDate || null,
    });

    return { message: "Tạo album thành công", albumId };
  },

  // 🟡 Cập nhật Album
  async updateAlbum(albumId, data, file) {
    const existing = await AlbumRepository.findById(albumId);
    if (!existing) throw new Error("Album không tồn tại");

    const updateData = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.releaseDate !== undefined) updateData.releaseDate = data.releaseDate;

    // Check nếu có upload ảnh mới
    if (file) {
      updateData.coverUrl = await this.uploadCover(file);
    }

    // Logic kiểm tra Tên và Ca sĩ mới
    const newName = data.name ? data.name.trim() : existing.name;
    const newSingerId = data.singerId || existing.singerId;

    if (newName !== existing.name || newSingerId !== existing.singerId) {
      // Nếu đổi ca sĩ -> Check ca sĩ tồn tại
      if (newSingerId !== existing.singerId) {
        const singer = await SingerRepository.findById(newSingerId);
        if (!singer) throw new Error("Ca sĩ mới không tồn tại");
      }

      // Check trùng lặp
      const isDuplicate = await AlbumRepository.checkDuplicate(newName, newSingerId, albumId);
      if (isDuplicate) {
        throw new Error(`Cập nhật thất bại: Ca sĩ này đã có album '${newName}'.`);
      }

      updateData.name = newName;
      updateData.singerId = newSingerId;
    }

    const success = await AlbumRepository.update(albumId, updateData);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật album thành công" };
  },

  // 🔴 Xóa Album (Có ràng buộc)
  async deleteAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // 1. Kiểm tra xem album có chứa bài hát nào không
    const hasSongs = await AlbumRepository.hasSongs(albumId);
    if (hasSongs) {
      throw new Error(`Không thể xóa album '${album.name}' vì đang chứa bài hát.`);
    }

    const success = await AlbumRepository.delete(albumId);
    if (!success) throw new Error("Xóa album thất bại");

    return { message: "Đã xóa album thành công" };
  },
};

module.exports = AlbumService;