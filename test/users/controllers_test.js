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

const error_messages = require('../../error_handler').messages;

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

            it('it should return 404 (no user found)', (done) => {
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

        describe('[GET] /api/users', () => {
            it('it should get all users, but none is registered (empty DB)', (done) => {
                chai.request(app)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.all.keys(["auth" , "response"]);
                    res.body.response.should.be.a("array");
                    res.body.response.length.should.be.eql(0);
                    done();
                });
            });

            it('it should get all users with only their public fields (no auth)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    () => {
                        chai.request(app)
                        .get('/api/users')
                        .end((err, res) => {
                            res.body.auth.should.be.false;
                            res.body.response.length.should.be.eql(1);
                            res.body.response[0].should.have.all.keys(usersService.restrictedFields);
                            done();
                        });
                    }
                );
            });

            it('it should get all users with all fields (auth)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users')
                        .set('x-access-token', usersService.getToken(user))
                        .end((err, res) => {
                            res.body.auth.should.be.true;
                            res.body.response.length.should.be.eql(1);
                            res.body.response[0].should.have.all.keys(usersService.publicFields);
                            done();
                        });
                    }
                );
            });

        });

        describe('[GET] /api/users/:id', () => {

            it('it should return the given user, with only restricted fields (no auth)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .end((err, res) => {
                            res.body.auth.should.be.false;
                            res.body.response.should.have.all.keys(usersService.restrictedFields);
                            res.body.response.should.have.property('id').eql(user.id);
                            done();
                        });
                    }
                );
            });

            it('it should return the given user, with only public fields (with auth)', (done) => {
                usersService.create("Alice", "Alice@gmail.com", "password").then(
                    (alice) => {
                        usersService.create("Bob", "Bob@gmail.com", "password").then(
                            (user) => {
                                chai.request(app)
                                .get('/api/users/'+alice.id)
                                .set('x-access-token', usersService.getToken(user))
                                .end((err, res) => {
                                    res.body.auth.should.be.true;
                                    res.body.response.should.have.all.keys(usersService.publicFields);
                                    res.body.response.should.have.property('id').eql(alice.id);
                                    done();
                                });
                            }
                        );
                    }
                );
            });

            it('it should return the given user, with all fields (auth + me)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .set('x-access-token', usersService.getToken(user))
                        .end((err, res) => {
                            res.body.auth.should.be.true;
                            res.body.response.should.have.all.keys(usersService.privateFields);
                            res.body.response.should.have.property('id').eql(user.id);
                            done();
                        });
                    }
                );
            });

            it('it should return a 404 (no user found)', (done) => {
                chai.request(app)
                .get('/api/users/12')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.status.should.eql(404);
                    res.body.message.should.eql(
                        error_messages.prefix.not_found + error_messages.not_found.user_with_id + '12'
                    );
                    done();
                });
            });

        });

        describe('[POST] /api/users', () => {

            it('it should create an user successfully', (done) => {
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({name:"Bob" ,email: 'Bob@gmail.com', password: 'password'})
                .end((err, res) => {
                    res.body.should.have.all.keys(usersService.privateFields);
                    models.User.findOne({ where: {email: 'Bob@gmail.com', name:"Bob"}}).then(
                        (user) => {
                            user.should.exist;
                        }
                    );
                    done();
                });
            });

            it('it should return a 400 error (Bad Request)', (done) => {
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({name:"Bob", password: 'password'})
                .end((err, res) => {
                    res.status.should.eql(400);
                    res.body.status.should.eql(400);
                    res.body.message.should.be.eql(error_messages.prefix.bad_request + error_messages.missing.email);
                    done();
                });
            });

            it('it should return a 400 error (Validation)', (done) => {
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({name:"Bob", email:"Bob@gmail.com", password: 'psw'})
                .end((err, res) => {
                    res.status.should.eql(400);
                    res.body.status.should.eql(400);
                    res.body.message.should.be.eql(error_messages.prefix.validation + error_messages.validation.password);
                    done();
                });
            });
        });

        describe('[PUT] /api/users', () => {

            it('it should update the user successfully', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .put('/api/users/'+user.id)
                        .set('x-access-token', usersService.getToken(user))
                        .send({name: "Alice"})
                        .end((err, res) => {
                            res.body.user.should.have.all.keys(usersService.privateFields)
                            res.body.user.name.should.eql("Alice");
                            res.body.updated.status.should.be.true;
                            res.body.updated.should.have.all.keys("status", "fields");
                            res.body.updated.fields.should.be.a('array');
                            res.body.updated.fields.should.include('name');
                            done();
                        });
                    }
                );
            });

            it('it shouldn\'t update anything (Bad Request)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        chai.request(app)
                        .put('/api/users/'+user.id)
                        .set('x-access-token', usersService.getToken(user))
                        .send({nameeee: "Alice"})
                        .end((err, res) => {
                            res.body.user.should.have.all.keys(usersService.privateFields);
                            res.body.updated.should.have.all.keys("status");
                            res.body.updated.status.should.be.false;
                            res.body.updated.should.not.have.key("fields");
                            done();
                        });
                    }
                );
            });

            it('it should return a 401 error (unauthorized)', (done) => {
                chai.request(app)
                .put('/api/users/1')
                .set('content-type', 'application/x-www-form-urlencoded')
                .end((err, res) => {
                    res.status.should.eql(401);
                    res.body.status.should.eql(401);
                    res.body.message.should.be.eql(
                        error_messages.prefix.bad_credentials + error_messages.bad_credentials.unauthorized
                    );
                    done();
                });
            });

        });

    });

});
