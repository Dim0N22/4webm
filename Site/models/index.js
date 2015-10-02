var mongoose = require('mongoose');
var config = require('../libs/config');

mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoose:uri'));

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('Connection error', err);
});

db.once('open', function callback() {
    console.log("Connected to DB!");
});


module.exports.db = db;