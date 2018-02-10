'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING(126).BINARY,
            allowNull: false,
            unique: true
        }
    });

    User.associate = function(models) {
        models.User.hasMany(models.Post);
    };

  return User;
};
