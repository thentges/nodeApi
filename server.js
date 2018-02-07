const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// the port the server is running on
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes')(app, {});
app.listen(port, () => {
  console.log('We are live on ' + port);
});
