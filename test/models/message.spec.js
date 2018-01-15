var assert = require('assert');

import Message from '../lib/models/message';
import { MAX_PROCESS_ATTEMPTS } from '../lib/models/message';

describe('Message', () => {
  describe('#constructor()', () => {
    context('without a message body', () => {
      const createMessageWithoutBody = () => {
        new Message();
      };
      it('should raise an error', () => {
        assert.throws(createMessageWithoutBody, Error);
      });
    });

    context('with a valid message body', () => {
      const body = 'this is totally valid';
      const message = new Message(body);
      it('should store the body', () => {
        assert.equal(body, message.body);
      });

      it('should initialize the process counter', () => {
        assert.equal(0, message.processCounter);
      });

      it('should have a createdAt timestamp', () => {
        // this tests that the timestamp was created in the last 10 seconds
        const now = new Date();
        assert.ok(message.createdAt - now < 10000);
      });

      it('should generate a unique id number', () => {
        const message2 = new Message(body);
        assert.notEqual(message.id, message2.id);
      });
    });
  });

  describe('#isFresh()', () => {
    context('with a message that HAS NOT been processed', () => {
      const message = new Message('fresh');

      it('returns true', () => {
        assert.ok(message.isFresh());
      });
    });

    context('with a message that HAS been processed', () => {
      const message = new Message('not fresh');
      message.incrementProcessCount();

      it('returns false', () => {
        assert.ok(!message.isFresh());
      });
    });
  });

  describe('#hasFailedAndCanBeReprocessed', () => {
    context('with a message with 0 process attempts', () => {
      const message = new Message('fresh');
      it('should be false', () => {
        assert.ok(!message.hasFailedAndCanBeReprocessed());
      });
    });

    context('with a message with a few process attempts', () => {
      const message = new Message('fresh');
      message.incrementProcessCount();
      message.incrementProcessCount();

      it('should be true', () => {
        assert.ok(message.hasFailedAndCanBeReprocessed());
      });
    });

    context('with a message with more than MAX_PROCESS_ATTEMPTS attempts', () => {
      const message = new Message('fresh');
      message.processCounter = MAX_PROCESS_ATTEMPTS + 1;

      it('should be false', () => {
        assert.ok(!message.hasFailedAndCanBeReprocessed());
      });
    });
  });

  describe('#isUnprocessable()', () => {
    context('with a message that CAN be processed again', () => {
      const message = new Message('its not dead');
      it('returns true', () => {
        assert.ok(!message.isUnprocessable());
      });
    });

    context('with a message that CANNOT be processed again', () => {
      const message = new Message('yep its dead');
      for(let i = 0; i < 5; i++) {
        message.incrementProcessCount();
      }
      it('returns false', () => {
        assert.ok(message.isUnprocessable());
      });
    });
  });
});
