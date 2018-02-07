const em = require('../model/entity_manager');
const dbm = require('../model/db_manager');

module.exports = function(app) {
    app.post('/test/add', (req, res, next) => {
        if (!req.body.title) {
            res.status(400).send('no title specified');
            return;
        }
        var id = em.addTest(req.body.title);
        res.status(201).ssend({
            title: req.body.title,
            id: id
        });
    });

    app.get('/test/:id', (req, res, next) => {
        var test = em.get('test', null, {"rowid" : "="+req.params.id});
        if (!test)
            res.status(404).send('no resource found')
        res.send(test);
    });

    // app.post('/db/create', (req, res, next) => {
    //     if (!dbm.dbExist()){
    //         dbm.createDB();
    //         res.status(201).send("database created");
    //     }
    //     else
    //         res.status(409).send('database already exists');
    // });

    app.put('/db/update', (req, res, next) => {
        dbm.updateDB();
        res.send("database cleared and schema updated, reload the server to use it");
    });

    // app.delete('/db/delete', (req, res, next) => {
    //     if (dbm.dbExist()){
    //         dbm.deleteDB();
    //         res.status(200).send('database successfully deleted');
    //     }
    //     else {
    //         res.status(409).send('there is no database');
    //     }
    // })
};
