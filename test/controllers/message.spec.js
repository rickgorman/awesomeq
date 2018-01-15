import chai from 'chai';
import chaiHttp from 'chai-http';
const should = chai.should();

import server from '../../lib/server';

chai.use(chaiHttp);


describe('MessageController', () => {
  // reset the db before each test
  beforeEach((done) => {
    global.db._topics = {};
    global.db.createTopic('awesome');
    done();
  });

  describe('POST /topics/:topicId/sendMessage', () => {
    it('should add a message to the topic', (done) => {
      const topicId = global.db.getTopic('awesome').id;

      chai.request(server)
        .post(`/topics/${topicId}/sendMessage`)
        .type('form')
        .send({ messageBody: 'this should work' })
        .end((err, res) => {
          res.should.have.status(200);
          should.exist(res.body);
          should.exist(res.body.data);
          res.body.data.should.be.a('array');
          res.body.data.length.should.be.eql(1);

          should.exist(res.body.relationships);
          res.body.relationships.topic.data.id.should.be.eql(topicId);
          done();
        });
    });
  });

  describe('GET /topics/:topicId/receiveMessage', () => {
    context('when there are messages in the queue', () => {
      it('should receive one message', (done) => {
        global.db.getTopic('awesome').sendMessage('message1');
        const topicId = global.db.getTopic('awesome').id;

        chai.request(server)
          .get(`/topics/${topicId}/receiveMessage`)
          .end((err, res) => {
            res.should.have.status(200);
            should.exist(res.body);
            should.exist(res.body.data);
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(1);

            should.exist(res.body.relationships);
            res.body.relationships.topic.data.id.should.be.eql(topicId);
            done();
          });

      });
    });

    context('when the queue is empty', () => {
      it('should respond with a 204', (done) => {
        const topicId = global.db.getTopic('awesome').id;
        chai.request(server)
          .get(`/topics/${topicId}/receiveMessage`)
          .end((err, res) => {
            res.should.have.status(204);
            done();
          });

      });
    });
  });
});
