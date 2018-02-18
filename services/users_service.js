const models  = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const restrictedFields = ['id', 'name'];
const publicFields = ['id', 'name', 'email'];

const privateFields = ['id', 'name', 'email', 'createdAt', 'updatedAt'];

const create = function(req_name, req_email, req_pw) {
    return new Promise((resolve, reject) => {
            models.User.create({
                name: req_name,
                email: req_email,
                password: req_pw
            }).then(function(success) {
                resolve(success);
            }, function(error){
                reject(error);
            });
    });
}

const isPasswordOK = function(password, pw_hash){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, pw_hash, function(err, res) {
            if (res) {
                resolve();
            }
            else {
                reject();
            }
        });
    });
}

const getToken = function(user){
    var payload = user.get({plain : true});
    payload.password = undefined;

    return token = jwt.sign(payload, config.jwt_encryption, {
        expiresIn: config.jwt_expiration
    });
}


module.exports = {
    create : create,
    restrictedFields : restrictedFields,
    publicFields : publicFields,
    privateFields : privateFields,
    isPasswordOK : isPasswordOK,
    getToken : getToken
}
