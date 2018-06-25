const models  = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const utils = require('./utils')

const isPasswordOK = (password, pw_hash) => {
    return new Promise(
        (resolve) => {
            bcrypt.compare(password, pw_hash, (err, res) => {
                if (res) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        }
    );
}

const getToken = user => {
    const payload = user.get({plain : true});
    payload.password = undefined;

    return token = jwt.sign(payload, config.jwt_encryption, {
        expiresIn: config.jwt_expiration
    });
}

const decode = (token) => {
    return new Promise(
        (resolve) => {
            jwt.verify(token, config.jwt_encryption, function(err, decoded) {
                if (err) {
                    utils.log(err);
                    resolve(null)
                }
                else {
                    resolve(decoded)
                }
            });
        }
    )
}


module.exports = {
    isPasswordOK,
    getToken,
    decode
}
