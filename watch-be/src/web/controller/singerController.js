const SingerService = require("../../services/singerService");

class SingerController {
  async getAll(req, res) {
    try {
      const singers = await SingerService.getAllSingers();
      res.status(200).json({ success: true, data: singers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const singer = await SingerService.getSingerById(req.params.id);
      res.status(200).json({ success: true, data: singer });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const result = await SingerService.createSinger(req.body);
      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const result = await SingerService.updateSinger(req.params.id, req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await SingerService.deleteSinger(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SingerController();
