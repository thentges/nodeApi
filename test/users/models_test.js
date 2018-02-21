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

    describe('SERVICES (Models)' , () => {

        describe('[create]  _  creating a user', () => {
            it('it should encrypt password in DB', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    (user) => {
                        user.password.should.not.eql('password');
                        user.password.indexOf('$2a$10').should.eql(0);
                        done();
                    }
                );
            });

            it('it should not create a user (password validation)', (done) => {
                usersService.create("Bob", "Bob@gmail.com", "abc").should.be.rejected.and.notify(done);
            });

            it('it should not create a user (email validation)', (done) => {
                // invalid email
                usersService.create("Bob", "not an email", "password").should.be.rejected;

                // already used email (constraint)
                usersService.create("Bob", "Bob@gmail.com", "password").then(
                    () => {
                        usersService.create("Bobby", "Bob@gmail.com", "password").should.be.rejected.and.notify(done);
                    }
                );
            });
        });

    });

});
