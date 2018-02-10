const models  = require('../models');

const create = function(req_name, req_email) {
    return new Promise((resolve, reject) => {
        models.User.create({
            name: req_name,
            email: req_email
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
