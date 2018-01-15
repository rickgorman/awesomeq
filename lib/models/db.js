import Topic from './topic';

class Database {
  constructor() {
    this._topics = {};
  }

  getTopic(name) {
    if (!this._topics[name])
      throw new Error(`no topic found with name: ${name}`);

    return this._topics[name];
  }

  createTopic(name, timeout) {
    if (this._topics[name])
      throw new Error("A topic by that name already exists");

    this._topics[name] = new Topic(name, timeout);
  }

  _topicCount() {
    return Object.keys(this._topics).length;
  }
}

export default Database;
