const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const userRouter = require('./app/controllers/users');
const dbRouter = require('./app/controllers/db');

// the port the server is running on
const port = 5000;


app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRouter);

app.use('/db', dbRouter);

app.listen(port, () => {
  console.log('We are live on ' + port);
});
