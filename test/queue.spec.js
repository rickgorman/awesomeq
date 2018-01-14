var assert = require('assert');

import Queue from '../lib/queue';
import Message from '../lib/message';

describe('Queue', () => {
  describe('#constructor()', () => {
    const q = new Queue();
    it('should create a queue of length 0', () => {
      assert.equal(0, q.length);
    });
  });

  describe('#enqueue()', () => {
    context('with an empty queue', () => {
      const q = new Queue();
      const first = new Message('first');
      const second = new Message('second');

      q.enqueue(first);

      it('should add a new element onto the BACK of the queue', () => {
        assert.equal(1, q.length);
        assert.equal(first, q._peek());

        q.enqueue(second);
        assert.equal(2, q.length);
        assert.equal(first, q._peek());

        q.dequeue();
        assert.equal(second, q._peek());
      });
    });

    context('with a non-empty queue', () => {
      const q = new Queue();
      const first = new Message('first');

      const addDuplicateMessage = () => {
        q.enqueue(first);
        q.enqueue(first);
      };

      it('should throw an error when attempting to add a duplicate message', () => {
        assert.throws(addDuplicateMessage, Error);
      });
    });
  });

  describe('#dequeue()', () => {
    context('with a non-empty queue', () => {
      const q = new Queue();
      const first = new Message('first');
      q.enqueue(first);

      it('should return the front-most entry in the queue', () => {
        const expected = q._peek();
        assert.equal(q.dequeue(), expected);
      });
    });

    context('with an empty queue', () => {
      const dequeueAnEmptyQueue = () => {
        const q = new Queue();
        q.dequeue();
      };

      it('should throw an error', () => {
        assert.throws(dequeueAnEmptyQueue, Error);
      })
    })
  });

  describe('#enqueueToFront()', () => {
    context('when the message does not exist in the queue', () => {
      const q = new Queue();
      const one = new Message('one');
      const two = new Message('two');
      q.enqueue(one);
      it('should add the given message to the front of the queue', () => {
        q.enqueueToFront(two);
        assert.equal(two, q._peek());
      });
    });

    context('when the message IS A DUPLICATE of one in the queue', () => {
      const q = new Queue();
      const one = new Message('one');
      q.enqueue(one);

      const addDuplicateMessage = () => {
        q.enqueue(one);
      };

      it('should throw an error if the message already exists in the queue', () => {
        assert.throws(addDuplicateMessage, Error);
      });
    });
  });

});
