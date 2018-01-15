export const MAX_PROCESS_ATTEMPTS = 5;

class Message {
  constructor(body) {
    if (!body)
      throw new Error("body required");

    this.body = body;
    this.processCounter = 0;
    this.createdAt = new Date();
    this.id = Message.nextId++;
  }

  _incrementProcessCount() {
    this.processCounter++;
  }

  isFresh() {
    return this.processCounter === 0;
  }

  hasFailedAndCanBeReprocessed() {
    return !this.isFresh() && !this.isUnprocessable();
  }

  isUnprocessable() {
    return this.processCounter >= MAX_PROCESS_ATTEMPTS;
  }

  toJSONWithTopicID(topicId) {
    return {
      data: [{
        id: this.id,
        body: this.body,
        createdAt: this.createdAt,
        startedAt: new Date(),
        processAttempts: this.processCounter,
      }],
      relationships: {
        topic: {
          data: { id: topicId }
        }
      }
    };
  }

  startNow() {
    this.startedAt = new Date();
  }
}

Message.nextId = 0;

export default Message;
