export class History {
  constructor({
    historyId,
    userId,
    songId,
    listenedAt
  }) {
    this.historyId = historyId;
    this.userId = userId;
    this.songId = songId;
    this.listenedAt = listenedAt;
  }
}
