const dbm = require('./db_manager');

const addTest = (string) => {
    var query = "INSERT INTO test VALUES ('" + string + "')";
    dbm.db.run(query);
    var res = dbm.db.exec("SELECT rowid from test ORDER BY rowid DESC LIMIT 1");
    id = Number(res[0].values[0]);
    dbm.flushDB();
    return id;
};

const get = (Entity, info_to_get, find) => {
    if (!Entity)
        return null;

    if (!info_to_get)
        var query = "SELECT rowid as id, * FROM ";
    else
        var query = "SELECT rowid as id, " + info_to_get + " FROM ";

    query += Entity;

    if (find){
        query += " WHERE ";
        console.log(find);
        for (var i in find){
            query += Entity + "." + i + find[i];

        }
    }

    console.log(query);
    var response = dbm.db.exec(query);
    console.log(response);
    var resp = formatInfo(response);

    return resp;
};

const formatInfo = (response) => {
    if (!response[0])
        return null;
    else {
        if (response[0].columns.length == 2 && response[0].values.length == 1){
            return response[0].values[0][1];
        }
        else if (response[0].values.length >= response[0].columns.length){
            var resp = [];
            for (var j=0; j < response[0].values.length; j++){
                var track = [];

                for (var i=0; i<response[0].columns.length ; i++){
                        track[response[0].columns[i]] = response[0].values[j][i];
                }

                resp.push(track);
            }
        }
        else {
            var resp = [];
            for (var i=0; i<response[0].columns.length ; i++){
                resp[response[0].columns[i]] = response[0].values[0][i];
            }
        }
            return resp;
    }
}


module.exports = {
    addTest : addTest,
    get : get
};
