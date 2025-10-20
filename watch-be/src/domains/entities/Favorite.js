export class Favorite {
  constructor({
    userId,
    songId,
    createdAt
  }) {
    this.userId = userId;
    this.songId = songId;
    this.createdAt = createdAt;
  }
}
