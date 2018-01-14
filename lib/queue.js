class Queue {
  constructor() {
    this.length = 0;

    // Using the "two array" approach to building a queue with O(1) time
    //   complexity (amortized)
    this._inboxStack = [];
    this._outboxStack = [];

    // Track message keys separately in a hash to allow for O(1) duplicate
    //   checking
    this._messageKeys = {};
  }

  enqueue(message) {
    this._safePushToStack(message, this._inboxStack);
  }

  enqueueToFront(message) {
    this._safePushToStack(message, this._outboxStack);
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
    return this._messageKeys[message.id];
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

  _addMessageKey(message) {
    this._messageKeys[message.id] = true;
  }

  _removeMessageKey(message) {
    this._messageKeys[message.id] = undefined;
  }

  _addSecondaryTracking(message) {
    this._addMessageKey(message);
    this.length += 1;
  }

  _removeSecondaryTracking(message) {
    this._removeMessageKey(message);
    this.length -= 1;
  }

  _safePushToStack(message, stack) {
    this._checkForDuplicate(message);
    stack.push(message);
    this._addSecondaryTracking(message);
  }
}

export default Queue;
