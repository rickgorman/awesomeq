import chai from 'chai';
import chaiHttp from 'chai-http';
const should = chai.should();

import server from '../../lib/server';

chai.use(chaiHttp);

describe('Topics', () => {
  // empty the db before each test
  beforeEach((done) => {
    global.db._topics = {};
    done();
  });

  describe('GET /topics', () => {
    it('should GET a list of all topics', (done) => {
      global.db.createTopic('super');
      global.db.createTopic('awesome');

      chai.request(server)
        .get('/topics')
        .end((err, res) => {
          res.should.have.status(200);
          should.exist(res);
          should.exist(res.body);
          should.exist(res.body.data);
          res.body.data.should.be.a('array');
          res.body.data.length.should.be.eql(2);
          done();
        });
    });
  });

  describe('POST /topics', () => {
    context('with an UNUSED topic name', () => {
      it('should create a new topic and return 200', (done) => {
        chai.request(server)
          .post('/topics')
          .type('form')
          .send({ name: 'unused'})
          .end((err, res) => {
            res.should.have.status(200);
            should.exist(res);
            should.exist(res.body);
            should.exist(res.body.data);
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(1);
            done();
          });
      });
    });

    context('with an ALREADY USED topic name', () => {
      it('should return 409 with errors array', (done) => {
        const topicName = 'dupe';
        global.db.createTopic(topicName);

        chai.request(server)
          .post('/topics')
          .type('form')
          .send({ name: topicName})
          .end((err, res) => {
            res.should.have.status(409);
            should.exist(res);
            should.exist(res.body);
            should.exist(res.body.errors);
            res.body.errors.should.be.a('array');
            res.body.errors.length.should.be.eql(1);
            res.body.errors[0].title.should.be.eql("Duplicate topic name");
            res.body.errors[0].detail.should.be.eql(topicName);
            done();
          });
      });
    });
  });

  describe('GET /topics/:id', () => {
    context('with a valid topic id', () => {
      it('should GET the status of a specific topic', (done) => {
        const topicName = 'awesome';
        const topic = global.db.createTopic(topicName);

        chai.request(server)
          .get(`/topics/${topic.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            should.exist(res);
            should.exist(res.body);
            should.exist(res.body.data);
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(1);
            done();
          });
      });
    });

    context('with an invalid topic id', () => {
      it('should fail with a 404', (done) => {
        chai.request(server)
          .get(`/topics/${-1}`)
          .end((err, res) => {
            res.should.have.status(404);
            should.exist(res);
            should.exist(res.body);
            should.exist(res.body.errors);
            res.body.errors.should.be.a('array');
            res.body.errors.length.should.be.eql(1);
            done();
          });

      });
    });
  });

});
