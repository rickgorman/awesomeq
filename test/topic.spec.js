var assert = require('assert');

import Topic from '../lib/topic';
import Message from '../lib/message';

describe('Topic', () => {
  describe('#constructor()', () => {
    const name = 'super';
    const timeout = 30000;
    const defaultTimeout = 60000;

    context('normally', () => {
      var topic = new Topic(name, timeout);

      it('should create empty process queues', () => {
        assert.notEqual(topic.messagesAwaitingProcessing, undefined);
        assert.notEqual(topic.messagesBeingProcessed, undefined);
        assert.notEqual(topic.messagesUnprocessable, undefined);
      });
    });

    context('when given valid parameters', () => {
      var topic = new Topic(name, timeout);

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

      var topicWithoutTimeout = new Topic(name);

      it('should use the default timeout', () => {
        assert.equal(topicWithoutTimeout.timeout, defaultTimeout);
      });
    });
  });

  describe('#receiveMessage()', () => {
    var topic = new Topic('whatever');

    context('when given an as-yet-unseen Message object', () => {
      var message = new Message('foo');

      it('should add that message to the BACK of the wait queue', () => {
        topic.receiveMessage(message);
        assert.ok(topic.messagesAwaitingProcessing.includes(message));
      });
    });

    context('when given a message that has already been tested AND can be retried', () => {
      it('should add that message to the FRONT of the wait queue', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });
    });

    context('when given a message that can no longer be retried', () => {
      it('should add that message to the unprocessableMessages array', () => {
        assert.ok(false, 'UNIMPLEMENTED');
      });
    });
  });


});
