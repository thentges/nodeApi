const validator = require('validator');
const bcrypt = require('bcrypt');
testtt;
'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING(126).BINARY,
            allowNull: false,
            unique: true,
            validate: {
                isEmail : {
                    msg: "Not a valid email"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: 8,
                    msg: "Password length must be > 8"
                }
            },
        }
    });

    User.hook('afterValidate', (user, options) => {
        if (user._changed.hasOwnProperty('password')) {
            return new Promise((resolve, reject) => {
                bcrypt.hash(user.password, 10, function(err, hash) {
                    user.password = hash;
                    resolve();
                });
            });
        }
    });

  return User;
};
