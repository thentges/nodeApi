const models  = require('../models');
const bcrypt = require('bcrypt');

const create = function(req_name, req_email, req_pw) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(req_pw, 10, function(err, hash) {
            models.User.create({
                name: req_name,
                email: req_email,
                password: hash
            }).then(function(success) {
                resolve(success);
            }, function(error){
                reject(error);
            });
        });
    });
}

module.exports = {
    create : create
}
