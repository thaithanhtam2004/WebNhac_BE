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
    releaseDate = null,        
    popularityScore = 0,       
    createdAt
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
    this.releaseDate = releaseDate;           
    this.popularityScore = popularityScore;   
    this.createdAt = createdAt;
  }
}