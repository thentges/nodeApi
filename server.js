const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const middlewares = require('./middlewares');
const app = express();

// the port the server is running on
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));

var schema = buildSchema(`
  type Query {
    protected: String
    unprotected: String
  }
`);

var root = {
    protected: () => {
      return 'BRAVO tu as acces';
    },
    unprotected: () => {
      return 'tt le monde y a acces';
    }
};



const testMdl = (req, res, next) => {
    console.log(typeof req.body.query);
    if (req.body.query.protected){
        console.log('no rights');
        res.send('STOP');
    }
    else if (req.body.query.unprotected){
        console.log('gooo');
        next();
    }
    else {
        console.log('pas laè');
        next();
    }
}

app.use(middlewares.string_to_json);
// app.use(testMdl);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(port, () => {
  console.log('We are live on ' + port);
});
