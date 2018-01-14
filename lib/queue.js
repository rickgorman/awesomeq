class Queue {
  constructor() {
    this.length = 0;

    // Using the "two array" approach to building a queue with O(1) time
    //   complexity (amortized)
    this._inboxStack = [];
    this._outboxStack = [];
  }

  _peek() {
    // return the top element from the right-most non-empty stack
    if (!this._outboxStack.length) {
      return this._inboxStack[this._inboxStack.length - 1];
    } else {
      return this._outboxStack[this._outboxStack.length - 1];
    }
  }

  _checkForDuplicate(message) {
    if (this.includes(message))
      throw new Error("attempted to add a duplicate message");
  }

  enqueue(message) {
    this._checkForDuplicate(message);

    this._inboxStack.push(message);
    this.length += 1;
  }

  enqueueToFront(message) {
    this._checkForDuplicate(message);

    this._outboxStack.push(message);
  }

  dequeue() {
    if (!this.length)
      throw new Error("queue is empty");

    // when the outbox is empty, we dump the inbox into it
    if (this._outboxStack.length === 0) {
      for (let i = 0; i < this._inboxStack.length; i++)
        this._outboxStack.push(this._inboxStack.pop());
    }

    this.length -= 1;

    // then we return the topmost element of the outbox
    return this._outboxStack.pop();
  }

  includes(message) {
    return this._inboxStack.includes(message)
      || this._outboxStack.includes(message);
  }
}

export default Queue;
