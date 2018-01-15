let assert = require('assert');

import Topic from '../lib/models/topic';
import Message from '../lib/models/message';
import { MAX_PROCESS_ATTEMPTS } from '../lib/models/message';

describe('Topic', () => {
  describe('#constructor()', () => {
    const name = 'super';
    const timeout = 30000;
    const defaultTimeout = 60000;

    context('normally', () => {
      let topic = new Topic(name, timeout);

      it('should create empty process containers', () => {
        assert.notEqual(topic.messagesAwaitingProcessing, undefined);
        assert.notEqual(topic.messagesBeingProcessed, undefined);
        assert.notEqual(topic.messagesUnprocessable, undefined);
      });

      it('should initialize a set of processing statistics', () => {
        assert.equal(topic.statistics.singleFailures, 0);
        assert.equal(topic.statistics.multipleFailures, 0);
        assert.equal(topic.statistics.unprocessableMessages, 0);
        assert.equal(topic.statistics.messagesProcessed, 0);
        assert.equal(topic.statistics.averageProcessingTimeMS, 0);
      });
    });

    context('when given valid parameters', () => {
      let topic = new Topic(name, timeout);

      it('should store the given name', () => {
        assert.equal(topic.name, name);
      });

      it('should store the given timeout', () => {
        assert.equal(topic.timeout, timeout);
      });
    });

    context('when given empty parameters', () => {
      const createTopicWithoutParams = () => {
        new Topic();
      };

      it('should throw an error for an empty name', () => {
        assert.throws(createTopicWithoutParams, Error);
      });

      let topicWithoutTimeout = new Topic(name);

      it('should use the default timeout', () => {
        assert.equal(topicWithoutTimeout.timeout, defaultTimeout);
      });
    });
  });

  describe('#sendMessage()', () => {
    const topic = new Topic('whatever');
    const body = 'awesome';

    it('should create a new message with the given body', () => {
      topic.sendMessage(body);
      assert.equal(body, topic.messagesAwaitingProcessing._peek().body);
    });

    it('should place this message at the BACK of the queue', () => {
      let secondBody = 'great';
      topic.sendMessage(secondBody);
      assert.equal(
        secondBody,
        topic.messagesAwaitingProcessing._peekRear().body
      );
    });
  });

  describe('#receiveMessage()', () => {
    context('with messages ready to process', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      let result;
      let message;

      it('should move one message from the messagesAwaitingProcessing to messagesBeingProcessed queue', () => {
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        message = topic.sendMessage(messageBody);
        assert.equal(1, topic.messagesAwaitingProcessing.length);

        result = topic.receiveMessage();
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        assert.equal(1, Object.keys(topic.messagesBeingProcessed).length);
      });

      it('should return a JSONAPI-formatted representation of the message', () => {
        assert.deepStrictEqual(
          result,
          {
            data: [{
              id: message.id,
              body: message.body,
              createdAt: message.createdAt,
              startedAt: result.data[0].startedAt,   // cheating here
              processAttempts: message.processCounter,
            }],
            relationships: {
              topic: {
                data: { id: topic.id }
              }
            }
          }
        );
      });
    });

    context('when the topic has no messages available to process', () => {
      const topic = new Topic('empty');

      const receiveMessageFromEmptyTopic = () => {
        topic.receiveMessage();
      };

      it('should raise an error', () => {
        assert.throws(receiveMessageFromEmptyTopic, Error);
      });
    });
  });

  describe('#acknowledgeCompletion()', () => {
    context('when given an as-yet-unseen Message object', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = new Message(messageBody);

      const acknowledgedUnseenMessage = () => {
        topic.acknowledgeCompletion(message.id);
      };

      it('should raise an error', () => {
        assert.throws(acknowledgedUnseenMessage, Error);
      });
    });

    context('when given a message that processed on its first try', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = topic.sendMessage(messageBody);

      topic.receiveMessage();

      const messagesProcessedBefore = topic.statistics.messagesProcessed;

      it('should remove that message from the queue', () => {
        topic.acknowledgeCompletion(message.id);
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        assert.equal(0, Object.keys(topic.messagesBeingProcessed).length);
        assert.equal(0, topic.messagesUnprocessable.length);
      });

      it('should adjust statistics accordingly', () => {
        assert.equal(1, topic.statistics.messagesProcessed);
        assert.ok(0 < topic.statistics.averageProcessingTimeMS);
      });
    });

    context('when given a message that processed after a single failure', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = topic.sendMessage(messageBody);

      topic.receiveMessage();
      topic.requeueMessage(message.id);
      topic.receiveMessage();

      topic.acknowledgeCompletion(message.id);

      it('should adjust statistics accordingly', () => {
        assert.equal(1, topic.statistics.messagesProcessed);
        assert.equal(1, topic.statistics.singleFailures);
      });
    });

    context('when given a message that processed after multiple failures', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = topic.sendMessage(messageBody);

      topic.receiveMessage();
      topic.requeueMessage(message.id);
      topic.receiveMessage();
      topic.requeueMessage(message.id);
      topic.receiveMessage();

      topic.acknowledgeCompletion(message.id);

      it('should adjust statistics accordingly', () => {
        assert.equal(1, topic.statistics.messagesProcessed);
        assert.equal(1, topic.statistics.multipleFailures);
      });
    });
  });

  describe('#requeueMessage()', () => {
    context('when given a message that has already been tested AND can be retried', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = topic.sendMessage(messageBody);

      topic.receiveMessage();
      topic.messagesBeingProcessed[message.id].processCounter = 1;
      topic.requeueMessage(message.id);
      it('should add that message to the FRONT of the wait queue', () => {
        assert.equal(
          message.id,
          topic.messagesAwaitingProcessing._peek().id
        );
      });
    });

    context('when given a message that can no longer be retried', () => {
      const topic = new Topic('whatever');
      const messageBody = 'foo';
      const message = topic.sendMessage(messageBody);

      topic.receiveMessage();

      topic.messagesBeingProcessed[message.id].processCounter = MAX_PROCESS_ATTEMPTS;

      topic.requeueMessage(message.id);

      it('should add that message to the unprocessableMessages array', () => {
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        assert.equal(0, Object.keys(topic.messagesBeingProcessed).length);
        assert.equal(1, topic.messagesUnprocessable.length);
      });
    });
  });

});
