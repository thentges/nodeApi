const models  = require('../models');

//TODO crypt passwords
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

module.exports = {
    create : create
}
