import Queue from '../lib/queue';
import Message from '../lib/message';

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

    this.statistics = {
      singleFailures: 0,
      multipleFailures: 0,
      unprocessableMessages: 0,
      averageProcessingTimeMS: 0,
    };
  }

  // send goes client -> server
  sendMessage(messageBody) {
    const message = new Message(messageBody);
    this.messagesAwaitingProcessing.enqueue(message);
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
}

Topic.nextId = 0;

export default Topic;
