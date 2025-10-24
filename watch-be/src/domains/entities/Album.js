// entities/Album.js
export class Album {
  constructor({
    albumId,
    name,
    singerId,
    coverUrl,
    description,
    totalViews = 0,
    releaseDate = null,
    createdAt = new Date(),
  }) {
    this.albumId = albumId;
    this.name = name;
    this.singerId = singerId;
    this.coverUrl = coverUrl;
    this.description = description;
    this.totalViews = totalViews;
    this.releaseDate = releaseDate;
    this.createdAt = createdAt;
  }
}
