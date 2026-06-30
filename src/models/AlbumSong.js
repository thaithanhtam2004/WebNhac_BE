// entities/AlbumSong.js
export class AlbumSong {
  constructor({
    albumId,
    songId,
    trackNumber = null,
  }) {
    this.albumId = albumId;       // liên kết tới Album
    this.songId = songId;         // liên kết tới Song
    this.trackNumber = trackNumber; // số thứ tự trong album
  }
}
