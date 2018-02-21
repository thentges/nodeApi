const validator = require('validator');
const bcrypt = require('bcrypt');
const error_messages = require('../error_handler').messages;


'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING(126).BINARY,
            allowNull: false,
            unique: true,
            validate: {
                isEmail : {
                    msg: error_messages.validation.email
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: 8,
                    msg: error_messages.validation.password
                }
            },
        }
    });

    User.associate = function(models) {
        models.User.hasMany(models.Post);
    };

    User.hook('afterValidate', (user, options) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10, function(err, hash) {
                user.password = hash;
                resolve();
            });
        });
    });

  return User;
};
