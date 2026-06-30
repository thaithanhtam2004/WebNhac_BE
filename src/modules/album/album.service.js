const { ulid } = require("ulid");
const AlbumRepository = require("./album.repository");

const AlbumService = {
  async getAllAlbums() {
    return await AlbumRepository.findAll();
  },

  async getAllAlbumsPaginated(params) {
    return await AlbumRepository.findAllPaginated(params);
  },

  async getAlbumById(albumId) {
    if (!albumId) throw new Error("Album ID không hợp lệ");
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");
    return album;
  },

  async createAlbum(data) {
    if (!data.name || !data.name.trim()) throw new Error("Tên album không được để trống");
    if (!data.singerId) throw new Error("Vui lòng chọn nghệ sĩ");
    
    const albumId = ulid();
    
    await AlbumRepository.create({
      albumId,
      name: data.name.trim(),
      singerId: data.singerId,
      coverUrl: data.coverUrl || null,
      description: data.description?.trim() || "",
      releaseDate: data.releaseDate || null,
    });

    return { success: true, message: "Tạo album thành công", albumId };
  },

  async updateAlbum(albumId, data) {
    const currentAlbum = await AlbumRepository.findById(albumId);
    if (!currentAlbum) throw new Error("Không tìm thấy album");

    const updateData = {};
    if (data.name !== undefined && data.name.trim()) updateData.name = data.name.trim();
    if (data.singerId !== undefined) updateData.singerId = data.singerId;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.releaseDate !== undefined) updateData.releaseDate = data.releaseDate;

    if (Object.keys(updateData).length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const success = await AlbumRepository.update(albumId, updateData);
    if (!success) throw new Error("Cập nhật thất bại");

    return { success: true, message: "Cập nhật album thành công" };
  },

  async deleteAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const hasSongs = await AlbumRepository.hasSongs(albumId);
    if (hasSongs) {
      throw new Error(`Không thể xóa '${album.name}' vì đang có bài hát trong album này.`);
    }

    const success = await AlbumRepository.delete(albumId);
    if (!success) throw new Error("Xóa album thất bại");

    return { success: true, message: "Xóa album thành công" };
  },

  async toggleVisibility(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const success = await AlbumRepository.update(albumId, { isHidden: !album.isHidden });
    if (!success) throw new Error("Cập nhật trạng thái thất bại");

    return { success: true, message: "Cập nhật trạng thái thành công" };
  },

  async bulkDelete(albumIds) {
    if (!albumIds || albumIds.length === 0) throw new Error("Danh sách ID rỗng");
    
    let cannotDelete = [];
    for (const id of albumIds) {
      const hasSongs = await AlbumRepository.hasSongs(id);
      if (hasSongs) cannotDelete.push(id);
    }
    if (cannotDelete.length > 0) {
      throw new Error(`Không thể xóa ${cannotDelete.length} album vì đang chứa bài hát.`);
    }

    const count = await AlbumRepository.bulkDelete(albumIds);
    return { success: true, message: `Đã xóa ${count} album thành công` };
  },

  async bulkToggleVisibility(albumIds) {
    if (!albumIds || albumIds.length === 0) throw new Error("Danh sách ID rỗng");
    const count = await AlbumRepository.bulkToggleVisibility(albumIds);
    return { success: true, message: `Đã cập nhật trạng thái ${count} album` };
  },
};

module.exports = AlbumService;
