
let mysql = require('mysql');

let messages = require('../language/en');

let database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    dateStrings: 'date'
});


database.connect((error) => {
    if (error) {
        console.log(messages.error_occurred, error);
    } else {
        console.log((messages.db_connect).toUpperCase() + ' TO -> ' + (process.env.DATABASE_NAME).toUpperCase());
    }
});

module.exports = database;