const config = require('config');

// to avoid shitty logging inside my tests
const log = (thingtolog) => {
    if (config.util.getEnv('NODE_ENV') != 'test')
        console.log(thingtolog);
}

module.exports = {
    log : log
}
