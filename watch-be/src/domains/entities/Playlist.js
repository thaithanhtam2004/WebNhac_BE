export class Playlist {
  constructor({
    playlistId,
    name,
    userId,
    createdAt
  }) {
    this.playlistId = playlistId;
    this.name = name;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
