const models  = require('../models');
const bcrypt = require('bcrypt');

const publicFields = ['id', 'name'];
const allFields = ['id', 'name', 'email'];

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


module.exports = {
    create : create,
    publicFields : publicFields,
    allFields : allFields,
    isPasswordOK : isPasswordOK
}
