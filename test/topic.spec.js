var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

import Topic from '../lib/topic';

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
        expect(createTopicWithoutParams).to.throw();
      });

      var topicWithoutTimeout = new Topic(name);

      it('should use the default timeout', () => {
        assert.equal(topicWithoutTimeout.timeout, defaultTimeout);
      });
    });
  });

  describe('#receiveMessage()', () => {
    context('when given an as-yet-unseen Message object', () => {
      it('should add that message to the BACK of the wait queue', () => {

      });
    });

    context('when given a message that has failed processing between 1-4 times', () => {
      it('should add that message to the FRONT of the wait queue', () => {

      });
    });

    context('when given a message that has failed processing 5+ times', () => {
      it('should add that message to the unprocessableMessages array', () => {

      });
    });
  });


});
