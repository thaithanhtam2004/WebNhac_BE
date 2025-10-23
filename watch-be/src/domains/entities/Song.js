export class Song {
  constructor({
    songId,
    title,
    duration,
    fileUrl,
    lyric,
    coverUrl,
    views = 0,
    singerId,
    genreId,
    createdAt,
    releaseDate = null, // ngày phát hành
    popularityScore = 0, // điểm phổ biến
  }) {
    this.songId = songId;
    this.title = title;
    this.duration = duration;
    this.fileUrl = fileUrl;
    this.lyric = lyric;
    this.coverUrl = coverUrl;
    this.views = views;
    this.singerId = singerId;
    this.genreId = genreId;
    this.createdAt = createdAt;
    this.releaseDate = releaseDate;
    this.popularityScore = popularityScore;
  }
}
