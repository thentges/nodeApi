const generalRoutes = require('./general_routes');
module.exports = function(app, db) {
  generalRoutes(app, db);
};
