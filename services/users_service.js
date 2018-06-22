const models  = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const restrictedFields = ['id', 'name'];
const publicFields = ['id', 'name', 'email'];

const privateFields = ['id', 'name', 'email', 'createdAt', 'updatedAt'];

const create = (req_name, req_email, req_pw) => {
    const object = { name: req_name, email: req_email, password: req_pw }
    return new Promise(
        async (resolve, reject) => {
            try {
                const new_user = await models.User.create(object);
                resolve(new_user);
            } catch (error) {
                reject(error);
            }
        }
    );
}

const isPasswordOK = (password, pw_hash) => {
    return new Promise(
        (resolve, reject) => {
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


module.exports = {
    create : create,
    restrictedFields : restrictedFields,
    publicFields : publicFields,
    privateFields : privateFields,
    isPasswordOK : isPasswordOK,
    getToken : getToken
}
