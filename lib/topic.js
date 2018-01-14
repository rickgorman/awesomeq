import Queue from '../lib/queue';

class Topic {
  constructor(name, timeout = 60000) {
    if (!name)
      throw Error("no name given");

    this.name = name;
    this.timeout = timeout;
    this.messagesAwaitingProcessing = new Queue();
    this.messagesBeingProcessed = new Queue();
    this.messagesUnprocessable = [];
  }
}

export default Topic;
