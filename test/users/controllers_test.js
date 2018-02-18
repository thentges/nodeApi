process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const app = require('../../server');
const models = require('../../models');
const usersService = require('../../services/users_service');

const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Users', () => {

    beforeEach((done) => { // empty db b4 each test
        models.sequelize.sync({force: true}).then(
            () => {
                done();
            }
        );
    });

    describe('ROUTES (Controllers)', ()=> {

        describe('[POST] /api/auth', () => {

            it('it should return a jwt token', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    () => {
                        chai.request(app)
                        .post('/api/auth')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({email: 'Bob@gmail.com', password: 'password'})
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.auth.should.be.true;
                            res.body.token.should.exist;
                            done();
                        });
                    }
                );
            });

            it('it should not return any token (wrong password)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    () => {
                        chai.request(app)
                        .post('/api/auth')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({email: 'Bob@gmail.com', password: 'yo'})
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.auth.should.be.false;
                            res.body.should.not.have.key("token");
                            done();
                        });
                    }
                );
            });

            it('it should return 404 status (no user found)', (done) => {
                chai.request(app)
                .post('/api/auth')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: 'Bob@gmail.com', password: 'password'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.auth.should.be.false;
                    res.body.should.not.have.key("token");
                    done();
                });
            });

        });

        describe('[GET] /api/users  _  no auth, empty DB', () => {
            it('it should get all users, but none is registered', (done) => {
                chai.request(app)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.auth.should.be.false;
                    res.body.should.have.all.keys(["auth" , "response"]);
                    res.body.response.should.be.a("array");
                    res.body.response.length.should.be.eql(0);
                    done();
                });
            });
        });

        describe('[GET] /api/users  _  no auth, DB not empty', () => {
            it('it should get all users with only their public fields', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    () => {
                        chai.request(app)
                        .get('/api/users')
                        .end((err, res) => {
                            res.body.auth.should.be.false;
                            res.body.response.length.should.be.eql(1);
                            res.body.response[0].should.have.all.keys(usersService.publicFields);
                            done();
                        });
                    }
                );
            });
        });

        describe('[GET] /api/users  _  with auth, DB not empty', () => {
            it('it should get all users with all fields', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users')
                        .set('x-access-token', usersService.getToken(user))
                        .end((err, res) => {
                            res.body.auth.should.be.true;
                            res.body.response.length.should.be.eql(1);
                            res.body.response[0].should.have.all.keys(usersService.allFields);
                            done();
                        });
                    }
                );
            });
        });

        describe('[GET] /api/users/:id  _  no auth', () => {
            it('it should return the given user, with only public fields', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .end((err, res) => {
                            res.body.auth.should.be.false;
                            res.body.response.should.have.all.keys(usersService.publicFields);
                            res.body.response.should.have.property('id').eql(user.id);
                            done();
                        });
                    }
                );
            });
        });

        describe('[GET] /api/users/:id  _  with auth', () => {
            it('it should return the given user, with all fields', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .set('x-access-token', usersService.getToken(user))
                        .end((err, res) => {
                            res.body.auth.should.be.true;
                            res.body.response.should.have.all.keys(usersService.allFields);
                            res.body.response.should.have.property('id').eql(user.id);
                            done();
                        });
                    }
                );
            });
        });

        describe('[POST] /api/users  _  all good', () => {
            it('it should create an user successfully', (done) => {
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({name:"Bob" ,email: 'Bob@gmail.com', password: 'password'})
                .end((err, res) => {
                    res.body.should.have.all.keys(usersService.allMyFields);
                    models.User.findOne({ where: {email: 'Bob@gmail.com', name:"Bob"}}).then(
                        (user) => {
                            user.should.exist;
                        }
                    );
                    done();
                });
            });
        });
    });

});
