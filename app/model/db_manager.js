const sql = require('sql.js');
const path = require('path');
const fs = require('fs');

const db_path = path.join(__dirname, './db.sqlite');

var filebuffer = fs.readFileSync(db_path);
const db = new sql.Database(filebuffer);


const flushDB = (dab) => {
    if (!dab)
        var data = db.export();
    else
        var data = dab.export();

    const buffer = new Buffer(data);
    console.log('db path : ' + db_path);
    fs.writeFileSync(db_path, buffer);
    console.log('file writed : ' + db_path);
}

const updateDB = () => {
    var newDB = new sql.Database();
    var query = "CREATE TABLE Track (description string, auth_id int);"; // posted_on , played_on, played_by, ...
    query += "CREATE TABLE User (name string, mail string);";
    newDB.run(query);
    flushDB(newDB);
    console.log('db updated');
}

const dbExist = () => {
    if (fs.existsSync(db_path))
        return true;
    else
        return false;
}

const deleteDB = () => {
    fs.unlink(db_path);
}

module.exports = {
    db : db,
    db_path : db_path,
    flushDB : flushDB,
    dbExist : dbExist,
    updateDB : updateDB
};
