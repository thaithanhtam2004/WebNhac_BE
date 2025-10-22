export class Album {
  constructor({ albumId, name, singerId, coverUrl, description, createdAt }) {
    this.albumId = albumId;
    this.name = name;
    this.singerId = singerId;
    this.coverUrl = coverUrl;
    this.description = description;
    this.createdAt = createdAt || new Date();
  }
}