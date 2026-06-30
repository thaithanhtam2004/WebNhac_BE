const AlbumSongRepository = require("./albumSong.repository");
const SongRepository = require("../song/song.repository");
const AlbumRepository = require("./album.repository");

const AlbumSongService = {
  // 🟢 Lấy danh sách bài hát trong album
  async getSongsByAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return songs; // Trả về mảng bài hát
  },

  // 🟢 Thêm nhiều bài hát vào album (Logic chính: CÓ CHECK CA SĨ)
  async addMultipleSongsToAlbum(albumId, songIds) {
    // 1. Kiểm tra đầu vào
    if (!Array.isArray(songIds) || songIds.length === 0) {
      throw new Error("Danh sách bài hát không hợp lệ");
    }

    // 2. Lấy thông tin Album để biết Album này của Ca sĩ nào
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // 3. Kiểm tra từng bài hát (Validate tồn tại & Validate đúng ca sĩ)
    for (const songId of songIds) {
      const song = await SongRepository.findById(songId);
      
      // Check bài hát tồn tại
      if (!song) throw new Error(`Bài hát với ID ${songId} không tồn tại`);

      // 🛑 [QUAN TRỌNG] Kiểm tra ca sĩ của bài hát có trùng với ca sĩ của album không
      // Ép kiểu String để so sánh chính xác (tránh lỗi khác kiểu dữ liệu)
      if (String(song.singerId) !== String(album.singerId)) {
        throw new Error(
          `Bài hát '${song.title}' thuộc về ca sĩ khác. Không thể thêm vào album của '${album.singerName}'.`
        );
      }
    }

    // 4. Gọi Repository để lưu (Sử dụng Transaction)
    await AlbumSongRepository.addMultipleSongsToAlbum(albumId, songIds);

    return { 
      message: `Đã thêm ${songIds.length} bài hát vào album`,
      count: songIds.length
    };
  },

  // 🟢 Thêm một bài hát vào album (CÓ CHECK CA SĨ)
  async addSongToAlbum(albumId, songId) {
    // 1. Check Album
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // 2. Check Bài hát
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");

    // 🛑 3. Check Ràng buộc Ca sĩ
    if (String(song.singerId) !== String(album.singerId)) {
      throw new Error("Bài hát này không thuộc về ca sĩ của album");
    }

    // 4. Lưu
    const success = await AlbumSongRepository.addSongToAlbum(albumId, songId);
    if (!success) throw new Error("Bài hát này đã có trong album");

    return { message: "Đã thêm bài hát vào album" };
  },

  // 🟢 Cập nhật danh sách bài hát (Dùng cho tính năng sắp xếp lại/Reorder)
  async updateAlbumSongs(albumId, songIds = []) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // Validate lại tất cả bài hát trước khi cập nhật
    for (const songId of songIds) {
      const song = await SongRepository.findById(songId);
      if (!song) throw new Error(`Bài hát ID ${songId} không tồn tại`);
      
      if (String(song.singerId) !== String(album.singerId)) {
         throw new Error(`Bài hát '${song.title}' không đúng ca sĩ.`);
      }
    }

    // Tạo mảng object có trackNumber dựa trên thứ tự mảng songIds
    const songs = songIds.map((songId, index) => ({
      songId,
      trackNumber: index + 1
    }));

    const success = await AlbumSongRepository.updateAlbumSongs(albumId, songs);
    if (!success) throw new Error("Cập nhật danh sách thất bại");

    return { message: "Đã cập nhật danh sách bài hát cho album" };
  },

  // 🟢 Xóa bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    // Không cần check album/song tồn tại ở đây vì câu lệnh SQL Delete sẽ trả về 0 row nếu không có.
    const success = await AlbumSongRepository.removeSongFromAlbum(albumId, songId);
    if (!success) throw new Error("Bài hát không có trong album này hoặc đã bị xóa");
    
    return { message: "Đã xóa bài hát khỏi album" };
  },
};

module.exports = AlbumSongService;