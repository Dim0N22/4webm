var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;

mongoose.connect(config.mongoose.uri);

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('Connection error', err);
});

db.once('open', function callback() {
    console.log("Connected to DB!");
});

var Any = new Schema({any: {}});

var webms = mongoose.model('webms', Any);
var tags = mongoose.model('tags', Any);


module.exports.webms = webms;
module.exports.tags = tags;