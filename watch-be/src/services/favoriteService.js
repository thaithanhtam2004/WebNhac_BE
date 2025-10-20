const FavoriteRepository = require("../infras/repositories/favoriteRepository");

const FavoriteService = {
  async getFavoritesByUser(user_id) {
    return await FavoriteRepository.findByUser(user_id);
  },

  async addFavorite(user_id, song_id) {
    const exists = await FavoriteRepository.exists(user_id, song_id);
    if (exists) throw new Error("Bài hát đã được yêu thích");
    await FavoriteRepository.add(user_id, song_id);
    return { message: "Đã thêm bài hát vào yêu thích" };
  },

  async removeFavorite(user_id, song_id) {
    await FavoriteRepository.remove(user_id, song_id);
    return { message: "Đã bỏ yêu thích bài hát" };
  },
};

module.exports = FavoriteService;
