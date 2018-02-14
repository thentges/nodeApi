require('./app/config/config');
// require('./global_functions');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const apiRouter = require('./app/controllers/api_ctrl');
const userRouter = require('./app/controllers/users_ctrl');

const models = require('./app/models');
// the port the server is running on
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

//TODO implement helmet for security reasons

app.use('/api', apiRouter);
app.use('/api/users', userRouter);

models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database');
})
.catch(err => {
    console.error('Unable to connect to SQL database:', err);
});

if (CONFIG.app === 'dev'){
    console.log('syncing db');
    models.sequelize.sync({force: false});
}

app.listen(port, () => {
  console.log('We are live on ' + port);
});
