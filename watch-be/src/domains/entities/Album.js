export class Album {
  constructor({
    albumId,
    name,
    singerId,
    coverUrl,
    description,
    createdAt,
    releaseDate = null, // ngày phát hành
    totalViews = 0, // tổng lượt nghe tất cả bài
  }) {
    this.albumId = albumId;
    this.name = name;
    this.singerId = singerId;
    this.coverUrl = coverUrl;
    this.description = description;
    this.createdAt = createdAt || new Date();
    this.releaseDate = releaseDate;
    this.totalViews = totalViews;
  }
}
