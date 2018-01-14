const MAX_PROCESS_ATTEMPTS = 5;

class Message {

  constructor(body) {
    if (!body)
      throw new Error("body required");

    this.body = body;
    this.processCounter = 0;
  }

  _incrementProcessCount() {
    this.processCounter++;
  }

  isFresh() {
    return this.processCounter === 0;
  }

  isUnprocessable() {
    return this.processCounter >= MAX_PROCESS_ATTEMPTS;
  }
}

export default Message;
