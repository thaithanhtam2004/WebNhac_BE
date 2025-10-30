const PlaylistService = require('../../services/playlistService');

class PlaylistController {
async getByUser(req, res) {
  try {
    const { id } = req.params; // lấy từ params
    const playlists = await PlaylistService.getPlaylistsByUser(id);
    res.status(200).json({ success: true, data: playlists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


  async getAll(req, res) {
    try {
      const playlists = await PlaylistService.getAllPlaylists();
      res.status(200).json({ success: true, data: playlists });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const playlist = await PlaylistService.getPlaylistById(id);
      res.status(200).json({ success: true, data: playlist });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { name, userId } = req.body;
      const result = await PlaylistService.createPlaylist({ name, userId });
      res.status(201).json({ success: true, message: result.message, playlistId: result.playlistId });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const result = await PlaylistService.updatePlaylist(id, name);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await PlaylistService.deletePlaylist(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async addSong(req, res) {
    try {
      const { playlistId, songId } = req.body;
      const result = await PlaylistService.addSongToPlaylist(playlistId, songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async removeSong(req, res) {
    try {
      const { playlistId, songId } = req.body;
      const result = await PlaylistService.removeSongFromPlaylist(playlistId, songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getSongs(req, res) {
    try {
      const { id } = req.params;
      const songs = await PlaylistService.getSongsOfPlaylist(id);
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new PlaylistController();
