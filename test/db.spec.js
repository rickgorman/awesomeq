var assert = require('assert');

import Database from '../lib/models/db';
import Topic from '../lib/models/topic';

describe('Database', function() {
  describe('#createTopic()', function() {
    context('when given a unique name', () => {
      const db = new Database();

      it('should add an additional queue', function() {
        assert.equal(0, db._topicCount());
        db.createTopic('red beans');
        assert.equal(1, db._topicCount());
      });
    });

    context('when given a duplicate name', () => {
      const db = new Database();

      const createTopicWithDuplicateName = () => {
        db.createTopic('black beans');
        db.createTopic('black beans');
      };

      it('should throw an error', () => {
        assert.throws(createTopicWithDuplicateName, Error);
        assert.equal(1, db._topicCount());
      });
    });
  });

  describe('#getTopic()', function() {
    context('when given a non-existant topic', () => {
      const db = new Database();

      it('should throw an error', () => {
        assert.throws(() => db.getTopic('nope'), Error);
      });
    });

    context('when given an existing topic', () => {
      const db = new Database();
      const topicName = 'cool';
      db.createTopic(topicName);

      it('should return that topic', () => {
        assert.equal(topicName, db.getTopic(topicName).name);
      });
    });
  });
});
