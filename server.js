const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const userRouter = require('./app/controllers/users_ctrl');

const models = require('./app/models');
// the port the server is running on
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/users', userRouter);

app.listen(port, () => {
  console.log('We are live on ' + port);
  models.sequelize.sync();
});
