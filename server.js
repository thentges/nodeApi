const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const graphqlHTTP = require('express-graphql');
const schema = require('./graphql');


const userRouter = require('./app/controllers/users_ctrl');

const models = require('./app/models');
// the port the server is running on
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

app.use('/users', userRouter);

models.sequelize.sync().then(() => {
    app.listen(port, () => {
      console.log('We are live on ' + port);
    });
});
