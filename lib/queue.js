class Queue {
  constructor() {
    this.length = 0;
  }

  _peek() {

  }

  _checkForDuplicate(message) {
    if (this.includes(message))
      throw new Error("attempted to add a duplicate message");
  }

  enqueue(message) {
    this._checkForDuplicate(message);

  }

  enqueueToFront(message) {
    this._checkForDuplicate(message);

  }

  dequeue() {
    if (!this.length)
      throw new Error("queue is empty");
  }

  includes(message) {
    return false;
  }
}

export default Queue;
