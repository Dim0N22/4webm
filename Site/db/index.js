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


var webm = new Schema({
    thread_id: Number,
    board: String,
    url: String,
    create_date: Date,
    file_info: Object,
    seqid: Number,
    tags: [String]
});

var webms = mongoose.model('webms', webm);


var tag = new Schema({name: String});
var tags = mongoose.model('tags', tag);


module.exports.webms = webms;
module.exports.tags = tags;