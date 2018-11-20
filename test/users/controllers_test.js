process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const app = require('../../server');
const models = require('../../models');
const usersService = require('../../services/users_service');
const authService = require('../../services/auth_service');

const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

const BOB = {name: "Bob", email: "Bob@gmail.com", password: "BOB_password"};
const ALICE = {name: "Alice", email: "Alice@gmail.com", password: "alice_password"}

describe('Users', () => {

    beforeEach(async () => await models.sequelize.sync({force: true}))

    describe('ROUTES (Controllers)', ()=> {

        describe('[POST] /api/auth', () => {

            it('it should return a jwt token', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    () => {
                        chai.request(app)
                        .post('/api/auth')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({email: BOB.email, password: BOB.password})
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.token.should.exist;
                            res.body.message.should.eql("authenticated")
                            done();
                        });
                    }
                );
            });

            it('it should not return any token (wrong password)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    () => {
                        chai.request(app)
                        .post('/api/auth')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({email: BOB.email, password: ALICE.password})
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.should.not.have.key("token");
                            res.body.type.should.eql("BadCredentialsError")
                            res.body.message.should.eql("invalid password")
                            done();
                        });
                    }
                );
            });

            it('it should return 404 (no user found)', (done) => {
                chai.request(app)
                .post('/api/auth')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: BOB.email, password: BOB.password})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.not.have.key("token");
                    res.body.type.should.eql("NotFoundError")
                    res.body.message.should.eql("email not found")
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
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(0);
                    done();
                });
            });

            it('it should get all users with only their restricted fields (no auth)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    () => {
                        chai.request(app)
                        .get('/api/users')
                        .end((err, res) => {
                            res.body.length.should.be.eql(1);
                            res.body[0].should.have.all.keys(usersService.restrictedFields);
                            done();
                        });
                    }
                );
            });

            it('it should get all users with only their restricted fields (invalid auth)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    () => {
                        chai.request(app)
                        .get('/api/users')
                        .set('x-access-token', "THIS IS NOT A VALID TOKEN")
                        .end((err, res) => {
                            res.body.length.should.be.eql(1);
                            res.body[0].should.have.all.keys(usersService.restrictedFields);
                            done();
                        });
                    }
                );
            });

            it('it should get all users with their public fields (auth)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users')
                        .set('x-access-token', authService.getToken(user))
                        .end((err, res) => {
                            res.body.length.should.be.eql(1);
                            res.body[0].should.have.all.keys(usersService.publicFields);
                            done();
                        });
                    }
                );
            });

        });

        describe('[GET] /api/users/:id', () => {

            it('it should return the given user, with only restricted fields (no auth)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .end((err, res) => {
                            res.body.should.have.all.keys(usersService.restrictedFields);
                            res.body.should.have.property('id').eql(user.id);
                            done();
                        });
                    }
                );
            });

            it('it should return the given user, with only public fields (with auth)', (done) => {
                usersService.create(ALICE.name, ALICE.email, ALICE.password).then(
                    (alice) => {
                        usersService.create(BOB.name, BOB.email, BOB.password).then(
                            (user) => {
                                chai.request(app)
                                .get('/api/users/'+alice.id)
                                .set('x-access-token', authService.getToken(user))
                                .end((err, res) => {
                                    res.body.should.have.all.keys(usersService.publicFields);
                                    res.body.should.have.property('id').eql(alice.id);
                                    done();
                                });
                            }
                        );
                    }
                );
            });

            it('it should return the given user, with all fields (auth + me)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .get('/api/users/'+user.id)
                        .set('Authorization', "Bearer " + authService.getToken(user))
                        .end((err, res) => {
                            res.body.should.have.all.keys(usersService.privateFields);
                            res.body.should.have.property('id').eql(user.id);
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
                    res.body.type.should.eql("NotFoundError");
                    done();
                });
            });

        });

        describe('[POST] /api/users', () => {

            it('it should create an user successfully', (done) => {
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(BOB)
                .end((err, res) => {
                    res.body.should.have.all.keys(usersService.privateFields);
                    models.User.findOne({ where: {email: BOB.email, name:BOB.name}}).then(
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
                .send({name: BOB.name, password: BOB.password})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.status.should.eql(400);
                    res.body.type.should.be.eql("MissingFieldError");
                    done();
                });
            });

            it('it should return a 400 error (Validation)', (done) => {
                invalid_pw = "psw"
                chai.request(app)
                .post('/api/users')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({name: BOB.name, email:BOB.email, password: invalid_pw})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.status.should.eql(400);
                    res.body.type.should.be.eql("ValidationError");
                    done();
                });
            });
        });

        describe('[PUT] /api/users', () => {

            it('it should update the user successfully', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .put('/api/users/'+user.id)
                        .set('x-access-token', authService.getToken(user))
                        .send({name: ALICE.name})
                        .end((err, res) => {
                            res.body.user.should.have.all.keys(usersService.privateFields)
                            res.body.user.name.should.eql(ALICE.name);
                            res.body.updated.status.should.be.true;
                            res.body.updated.should.have.all.keys("status", "fields");
                            res.body.updated.fields.should.be.a('array');
                            res.body.updated.fields.should.include('name');
                            res.body.updated.fields.should.not.include('email');
                            done();
                        });
                    }
                );
            });

            it('it shouldn\'t update anything (Bad Request)', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .put('/api/users/'+user.id)
                        .set('x-access-token', authService.getToken(user))
                        .send({nameeee: ALICE.name})
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

            it('it should return a 401 error (unlogged)', (done) => {
                chai.request(app)
                .put('/api/users/1')
                .set('content-type', 'application/x-www-form-urlencoded')
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.status.should.eql(401);
                    res.body.type.should.be.eql("BadCredentialsError");
                    done();
                });
            });

            it('it should return a 403 error (unauthorized)', (done) => {
                usersService.create(ALICE.name, ALICE.email, ALICE.password).then(
                    (alice) => {
                        usersService.create(BOB.name, BOB.email, BOB.password).then(
                            (bob) => {
                                chai.request(app)
                                .put('/api/users/'+bob.id)
                                .set('x-access-token', authService.getToken(alice))
                                .end((err, res) => {
                                    res.should.have.status(403);
                                    res.body.status.should.eql(403);
                                    res.body.type.should.be.eql("AccessDeniedError");
                                    done();
                                });
                            }
                        );
                    }
                )
            });

        });

        describe('[DELETE] /api/users/id', () => {

            it('it should delete the user successfully', (done) => {
                usersService.create(BOB.name, BOB.email, BOB.password).then(
                    (user) => {
                        chai.request(app)
                        .delete('/api/users/'+user.id)
                        .set('x-access-token', authService.getToken(user))
                        .end((err, res) => {
                            res.body.user.should.have.all.keys(usersService.privateFields)
                            res.body.user.name.should.eql(ALICE.name);
                            res.body.updated.status.should.be.true;
                            res.body.updated.should.have.all.keys("status", "fields");
                            res.body.updated.fields.should.be.a('array');
                            res.body.updated.fields.should.include('name');
                            res.body.updated.fields.should.not.include('email');
                            done();
                        });
                    }
                );
            });

            it('it should return a 401 error (unlogged)', (done) => {
                chai.request(app)
                .put('/api/users/1')
                .set('content-type', 'application/x-www-form-urlencoded')
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.status.should.eql(401);
                    res.body.type.should.be.eql("BadCredentialsError");
                    done();
                });
            });

            it('it should return a 403 error (unauthorized)', (done) => {
                usersService.create(ALICE.name, ALICE.email, ALICE.password).then(
                    (alice) => {
                        usersService.create(BOB.name, BOB.email, BOB.password).then(
                            (bob) => {
                                chai.request(app)
                                .put('/api/users/'+bob.id)
                                .set('x-access-token', authService.getToken(alice))
                                .end((err, res) => {
                                    res.should.have.status(403);
                                    res.body.status.should.eql(403);
                                    res.body.type.should.be.eql("AccessDeniedError");
                                    done();
                                });
                            }
                        );
                    }
                )
            });

        });


    });

});
