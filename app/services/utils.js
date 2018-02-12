const bcrypt = require('bcrypt');

const isPasswordOK = function(password, pw_hash){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, pw_hash, function(err, res) {
            if (res) {
                console.log('same');
                resolve();
            }
            else {
                console.log('dif');
                reject();
            }
        });
    });
}

module.exports = {
    isPasswordOK : isPasswordOK
};
