const { ulid } = require("ulid");
const SongRepository = require("../infras/repositories/songRepository");
// ✅ [QUAN TRỌNG] Import Repository liên quan để kiểm tra tồn tại
const SingerRepository = require("../infras/repositories/singerRepository");
const GenreRepository = require("../infras/repositories/genreRepository");

const SongService = {
  async getAllSongs() {
    return await SongRepository.findAll();
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

  async deleteSong(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");
    
    // Có thể thêm logic xóa file trên Cloudinary tại đây nếu cần
    
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
    return await SongRepository.searchAll(query.trim());
  },

  async getSongsBySinger(singerId) { return await SongRepository.findBySingerId(singerId); },
  async getSongsByGenre(genreId) { return await SongRepository.findByGenreId(genreId); },
  async getAllSongsWithFeature() { return await SongRepository.findAllWithFeature(); },
  
  async getHotTrend(limit = 10) {
    const songs = await SongRepository.findHotTrend(limit);
    return { success: true, data: songs, message: 'Lấy hot trend thành công' };
  },

  async getSongsByAlbum(albumId) {
    return await SongRepository.findByAlbumId(albumId);
  }

};

module.exports = SongService;