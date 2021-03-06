import Queue from './queue';
import Message from './message';

class Topic {
  constructor(name, timeout = 60000) {
    if (!name)
      throw new Error("no name given");

    this.name = name;
    this.timeout = timeout;
    this.id = ++Topic.nextId;

    this.messagesAwaitingProcessing = new Queue();
    this.messagesBeingProcessed = {};
    this.messagesUnprocessable = [];

    this.createdAt = new Date();

    this.statistics = {
      singleFailures: 0,
      multipleFailures: 0,
      messagesProcessed: 0,
      unprocessableMessages: 0,
      averageProcessingTimeMS: 0,
    };
  }

  // send goes client -> server
  sendMessage(messageBody) {
    const message = new Message(messageBody);
    this.messagesAwaitingProcessing.enqueue(message);

    // begin timer
    message.startNow();
    return message;
  }

  // receive goes server -> client
  receiveMessage() {
    if (!this.messagesAwaitingProcessing.length) {
      throw new Error("no message available");
    }

    // dequeue message and track it
    const message = this.messagesAwaitingProcessing.dequeue();
    this.messagesBeingProcessed[message.id] = message;

    return message.toJSONWithTopicID(this.id);
  }

  acknowledgeCompletion(messageId) {
    if (!this.messagesBeingProcessed[messageId])
      throw new Error("unknown message");

    // update statistics
    const message = this.messagesBeingProcessed[messageId];
    message.incrementProcessCount();
    this._updateStatistics(message);

    // remove message from the queue
    delete this.messagesBeingProcessed[messageId];

    return message.toJSONWithProcessingDetails(this.id);
  }

  requeueMessage(messageId) {
    const message = this.messagesBeingProcessed[messageId];
    message.incrementProcessCount();

    // remove message from the process queue
    delete this.messagesBeingProcessed[messageId];

    // move it into one of the other queues
    if (message.hasFailedAndCanBeReprocessed()) {
      this.messagesAwaitingProcessing.enqueueToFront(message);
    } else if (message.isUnprocessable()) {
      this.messagesUnprocessable.push(message);
    } else {
      throw new Error("unhandled message");
    }
  }

  _updateStatistics(message) {
    this.statistics.messagesProcessed += 1;

    // track failures
    if (message.processCounter === 2) {
      this.statistics.singleFailures += 1;
    } else if (message.processCounter > 2) {
      this.statistics.multipleFailures += 1;
    }

    // track timing
    const timeElapsedMS = new Date() - message.startedAt;
    this._updateAverageProcessingTime(timeElapsedMS);
  }

  _updateAverageProcessingTime(timeElapsedMS) {
    // do some math
    const oldTime = this.statistics.averageProcessingTimeMS;
    const quantity = this.statistics.messagesProcessed;
    const newTime = ((oldTime * quantity) + timeElapsedMS) / (quantity + 1);

    this.statistics.averageProcessingTimeMS = newTime;
  }

  // -- no test coverage beyond this point --
  getDetailsJSON() {
    const { id, name, statistics, createdAt } = this;
    return {
      data: [{
        id,
        name,
        attributes: {
          statistics,
          createdAt,
          processTimeout: this.timeout,
          messagesInQueue: this.messagesAwaitingProcessing.length,
          messagesBeingProcessed: Object.keys(this.messagesBeingProcessed).length,
        }
      }]
    };
  }

  requeueTimedOutMessages() {
    const now = new Date();
    let count = 0;
    Object.keys(this.messagesBeingProcessed).forEach((id) => {
      const expiryTime =
        Number(this.messagesBeingProcessed[id].startedAt) + this.timeout;

      if (Number(expiryTime) > Number(now)) {
        this.requeueMessage(id);
        count += 1;
      }

    });

    return count;
  }
}

Topic.nextId = 0;

export default Topic;
