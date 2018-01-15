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
});
