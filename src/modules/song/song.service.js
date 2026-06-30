const { ulid } = require("ulid");
const SongRepository = require("./song.repository");
// ✅ [QUAN TRỌNG] Import Repository liên quan để kiểm tra tồn tại
const SingerRepository = require("../singer/singer.repository");
const GenreRepository = require("../genre/genre.repository");
const cloudinary = require("../../config/cloudinary");

// Hàm hỗ trợ tách public_id từ URL Cloudinary
function extractPublicId(url) {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;
        let pathParts = parts.slice(uploadIndex + 1);
        if (pathParts.length > 0 && pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
            pathParts = pathParts.slice(1);
        }
        let pathWithExt = pathParts.join('/');
        const lastDot = pathWithExt.lastIndexOf('.');
        return lastDot !== -1 ? pathWithExt.substring(0, lastDot) : pathWithExt;
    } catch(err) {
        return null;
    }
}

const SongService = {
  async getAllSongs() {
    return await SongRepository.findAll();
  },
  async getAllSongsPaginated(options) {
    return await SongRepository.findWithFilters(options);
  },


  async getSongById(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");
    return song;
  },

  async increaseView(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");
    await SongRepository.increaseView(songId);
    return { message: "Đã tăng lượt nghe thành công" };
  },

  // 🟢 Tạo bài hát mới (Có Validation chuẩn)
  async createSong(data) {
    // 1. Validate Input
    if (!data.title || !data.singerId || !data.genreId) {
      throw new Error("Vui lòng nhập đủ Tên bài hát, Nghệ sĩ và Thể loại");
    }

    // 2. Validate Foreign Keys (Ca sĩ & Thể loại phải tồn tại)
    const singerExists = await SingerRepository.findById(data.singerId);
    if (!singerExists) throw new Error("Nghệ sĩ không tồn tại trong hệ thống");

    // (Nếu chưa có GenreRepository thì comment dòng này lại)
    if (GenreRepository) {
        const genreExists = await GenreRepository.findById(data.genreId);
        if (!genreExists) throw new Error("Thể loại không tồn tại");
    }

    // 3. Validate Business Logic (Chống trùng lặp)
    const isDuplicate = await SongRepository.checkDuplicate(data.title.trim(), data.singerId);
    if (isDuplicate) {
      throw new Error(`Bài hát '${data.title}' đã tồn tại cho nghệ sĩ này.`);
    }

    const songId = ulid();
    await SongRepository.create({
      ...data,
      title: data.title.trim(),
      songId,
    });

    return { message: "Tạo bài hát thành công", songId };
  },

  // 🟢 Cập nhật bài hát (Có Validation chuẩn)
  async updateSong(songId, data) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");

    // 1. Validate Singer nếu có thay đổi
    if (data.singerId && data.singerId !== song.singerId) {
       const singerExists = await SingerRepository.findById(data.singerId);
       if (!singerExists) throw new Error("Nghệ sĩ mới không tồn tại");
    }

    // 2. Validate Duplicate (Trừ chính bài hát đang sửa ra)
    if (data.title || data.singerId) {
        const newTitle = data.title ? data.title.trim() : song.title;
        const newSingerId = data.singerId || song.singerId;
        
        // Chỉ check khi có sự thay đổi
        if (newTitle !== song.title || newSingerId !== song.singerId) {
            const isDuplicate = await SongRepository.checkDuplicate(newTitle, newSingerId, songId);
            if (isDuplicate) {
                throw new Error(`Cập nhật thất bại: Bài hát '${newTitle}' đã tồn tại.`);
            }
        }
    }

    const success = await SongRepository.update(songId, data);
    if (!success) throw new Error("Cập nhật thất bại");
    return { message: "Cập nhật bài hát thành công" };
  },

  async toggleVisibility(songId) {
    const success = await SongRepository.toggleVisibility(songId);
    if (!success) throw new Error("Thay đổi trạng thái hiển thị thất bại");
    return { message: "Đã thay đổi trạng thái hiển thị" };
  },

  async bulkDelete(songIds) {
    // 1. Lấy thông tin các bài hát để xóa file trên Cloudinary
    const songs = await SongRepository.findByIds(songIds);
    if (songs && songs.length > 0) {
      for (const song of songs) {
        if (song.fileUrl) {
          const publicId = extractPublicId(song.fileUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "video" }).catch(e => console.error("Lỗi xóa audio hàng loạt:", e));
        }
        if (song.coverUrl) {
          const publicId = extractPublicId(song.coverUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(e => console.error("Lỗi xóa ảnh hàng loạt:", e));
        }
      }
    }

    // 2. Xóa khỏi Database
    const success = await SongRepository.bulkDelete(songIds);
    if (!success) throw new Error("Xóa hàng loạt thất bại");
    return { message: `Đã xóa ${songIds.length} bài hát` };
  },

  async bulkToggleVisibility(songIds) {
    const success = await SongRepository.bulkToggleVisibility(songIds);
    if (!success) throw new Error("Thay đổi trạng thái hiển thị hàng loạt thất bại");
    return { message: "Đã thay đổi trạng thái hiển thị hàng loạt" };
  },

  async deleteSong(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");
    
    // Xóa file trên Cloudinary
    if (song.fileUrl) {
      const publicId = extractPublicId(song.fileUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "video" }).catch(e => console.error("Lỗi xóa audio:", e));
    }
    if (song.coverUrl) {
      const publicId = extractPublicId(song.coverUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(e => console.error("Lỗi xóa ảnh:", e));
    }
    
    const success = await SongRepository.delete(songId);
    if (!success) throw new Error("Xóa thất bại");
    return { message: "Đã xóa bài hát thành công" };
  },

  async getSongByReleaseDate(){ return await SongRepository.findByReleaseDateDesc(); },

  async searchSongs(query) {
    if (!query || query.trim() === '') return { success: false, data: [], message: 'Vui lòng nhập từ khóa' };
    const songs = await SongRepository.searchSongs(query.trim());
    return { success: true, data: songs, total: songs.length, message: `Tìm thấy ${songs.length} kết quả` };
  }, 

  async searchAll(query) {
    if (!query || query.trim() === '') return { success: false, data: {}, message: 'Vui lòng nhập từ khóa' };
    const results = await SongRepository.searchAll(query.trim());
    return { success: true, data: results, message: 'Tìm kiếm thành công' };
  },

  async getSongsBySinger(singerId) { return await SongRepository.findBySingerId(singerId); },
  async getSongsByGenre(genreId) { return await SongRepository.findByGenreId(genreId); },
  async getAllSongsWithFeature() { return await SongRepository.findAllWithFeature(); },
  async getAllSongsWithFeaturePaginated(params) { return await SongRepository.findAllWithFeaturePaginated(params); },
  
  async getHotTrend(limit = 10) {
    const songs = await SongRepository.findHotTrend(limit);
    return { success: true, data: songs, message: 'Lấy hot trend thành công' };
  }
};

module.exports = SongService;