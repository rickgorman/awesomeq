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

    const topic = new Topic(name, timeout);
    this._topics[name] = topic;

    return {
      id: topic.id,
      name: topic.name
    };
  }

  getAllTopicsJSON() {
    const result = [];

    Object.keys(this._topics).forEach(topic => {
      const { id, name } = topic;

      result.push({
        id,
        name
      });
    });

    return result;
  }

  _topicCount() {
    return Object.keys(this._topics).length;
  }

  getTopicByID(id) {
    const keys = Object.keys(this._topics);

    debugger
    for (let i = 0; i < keys.length; i++) {
      let topic = this._topics[keys[i]];
      if (topic.id === id)
        return topic;
    }
    debugger

    throw new Error("Non-existing topic");
  }
}

export default Database;
