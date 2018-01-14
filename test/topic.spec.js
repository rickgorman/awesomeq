let assert = require('assert');

import Topic from '../lib/topic';
import Message from '../lib/message';
import { MAX_PROCESS_ATTEMPTS } from '../lib/message';

describe('Topic', () => {
  describe('#constructor()', () => {
    const name = 'super';
    const timeout = 30000;
    const defaultTimeout = 60000;

    context('normally', () => {
      let topic = new Topic(name, timeout);

      it('should create empty process queues', () => {
        assert.notEqual(topic.messagesAwaitingProcessing, undefined);
        assert.notEqual(topic.messagesBeingProcessed, undefined);
        assert.notEqual(topic.messagesUnprocessable, undefined);
      });

      it('should initialize a set of processing statistics', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });

      it('should receive a unique id number', () => {
        assert.ok(false, 'UNIMPLEMENTED');
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

    context('when given an as-yet-unseen Message object', () => {
      let topic = new Topic('whatever');
      let message = new Message('foo');

      it('should add that message to the BACK of the wait queue', () => {
        topic.sendMessage(message);
        assert.ok(topic.messagesAwaitingProcessing.includes(message));
      });
    });

    context('when given a message that has already been tested AND can be retried', () => {
      const topic = new Topic('whatever');
      const someMessage = new Message('something');
      topic.sendMessage(someMessage);

      const messageSecondAttempt = new Message('ok');
      messageSecondAttempt._incrementProcessCount();
      topic.sendMessage(messageSecondAttempt);

      it('should add that message to the FRONT of the wait queue', () => {
        assert.equal(
          messageSecondAttempt,
          topic.messagesAwaitingProcessing._peek()
        );
      });
    });

    context('when given a message that can no longer be retried', () => {
      const topic = new Topic('whatever');
      const message = new Message('foo');
      message.processCounter = MAX_PROCESS_ATTEMPTS - 1;
      topic.sendMessage(message);
      topic.receiveMessage();
      topic.sendMessage(message);

      it('should add that message to the unprocessableMessages array', () => {
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        assert.equal(0, topic.messagesBeingProcessed.length);
        assert.equal(1, topic.messagesUnprocessable.length);
      });
    });
  });

  describe('#receiveMessage()', () => {
    context('with messages ready to process', () => {
      const topic = new Topic('whatever');
      const message = new Message('foo');
      let result;

      it('should move one message from the messagesAwaitingProcessing to messagesBeingProcessed queue', () => {
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        topic.sendMessage(message);
        assert.equal(1, topic.messagesAwaitingProcessing.length);

        result = topic.receiveMessage();
        assert.equal(0, topic.messagesAwaitingProcessing.length);
        assert.equal(1, topic.messagesBeingProcessed.length);
      });

      it('should return a JSONAPI-formatted representation of the message', () => {
        assert.equal(
          result,
          {
            data: [{
              id: message.id,
              body: message.body,
              createdAt: message.createdAt,
              processAttempts: message.processAttempts,
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
    context('when performed on the first processing of a message', () => {
      it('should remove that message from the messagesBeingProcessed queue', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });

      it('should increment the messagesProcessed statistic', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });

      it('should adjust the averageProcessingTimeMS statistic', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });
    });

    context('when performed on the second processing of a message', () => {
      it('should increment the singleFailures statistic', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });
    });

    context('when performed on the third+ processing of a message', () => {
      it('should increment the multipleFailures statistic', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });
    });
  });


});
