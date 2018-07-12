process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const app = require('../../server');

const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('API', () => {

    it('it should return a 404 error json formatted', (done) => {
        chai.request(app)
        .get('/thisisnotaroute')
        .set('content-type', 'application/x-www-form-urlencoded')
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a("object");
            res.body.should.not.be.eql({});
            res.body.type.should.eql("NotFoundError")
            res.body.message.should.eql("not found")
            done();
        });
    });

});
