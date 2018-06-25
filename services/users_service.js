const models  = require('../models');

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

const getAll = (fieldsToGet) => {
    return new Promise(
        async (resolve) => {
            const resp = await models.User.findAll({attributes: fieldsToGet});
            resolve(resp);
        }
    )
}

const get = (id, fieldsToGet) => {
    return new Promise(
        async (resolve) => {
            const resp = await models.User.findById(id, {attributes: fieldsToGet});
            resolve(resp);
        }
    )
}

const getByEmail = email => {
    return new Promise(
        async (resolve) => {
            const user = await models.User.findOne({where: {email} })
            resolve(user)
        }
    )
}

// return a custom object containing the user, and the field updated if there is some
const update = (id, new_user) => {
    return new Promise(
        async (resolve, reject) => {
            const user = await models.User.findById(id);
            if (user){
                user.set(new_user);
                user.save();
                resolve(user);
            }
            else
                reject();
        }
    )
}

const formatPutResponse = user => {
    const user_without_pw = user.get();
    user_without_pw.password = undefined; // we do not want the password to be shown in the resp
    const fields = user.changed() ? Object.getOwnPropertyNames(user._changed) : undefined;
    const response = {
        user: user_without_pw,
        updated: {
            status: user.changed() ? true : false,
            fields: fields
        }
    };
    return response;
}

module.exports = {
    create,
    restrictedFields,
    publicFields,
    privateFields,
    getAll,
    get,
    update,
    getByEmail,
    formatPutResponse
}
