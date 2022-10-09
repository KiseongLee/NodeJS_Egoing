var mysql = require('mysql2');

var db = mysql.createConnection({
    host:'localhost',
    user: 'nodejs',
    password: 'sung6265',
    database:'opentutorials'
});
db.connect();

module.exports = db;