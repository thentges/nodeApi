const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('config');

const apiRouter = require('./controllers/api_ctrl');
const userRouter = require('./controllers/users_ctrl');

const models = require('./models');

const utils = require('./services/utils');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (config.util.getEnv('NODE_ENV') != 'test')
    app.use(morgan('dev'));

//TODO implement helmet for security reasons

app.use('/api', apiRouter);
app.use('/api/users', userRouter);

models.sequelize.authenticate().then(() => {
    utils.log('Connected to SQL database');
})
.catch(err => {
    utils.error('Unable to connect to SQL database:', err);
});

if (config.util.getEnv('NODE_ENV') == 'dev'){
    utils.log('syncing db');
    models.sequelize.sync({force: false});
}

app.listen(config.port, () => {
  utils.log('server listening on port ' + config.port);
  utils.log('environment is : ' + config.util.getEnv('NODE_ENV'));
});

module.exports = app;
