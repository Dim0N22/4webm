var url = require('url');
var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
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

var tag = new Schema({name: String}, {versionKey: false});
var tags = mongoose.model('tags', tag);

var maxwebmidSchema = new Schema({currentId: Number}, {collection: 'maxwebmid'});
var maxwebmid = mongoose.model('maxwebmid', maxwebmidSchema);

var user = new Schema({
    login: String,
    secret: String,
    token: String,
    roles: [String]
}, {versionKey: false});
var users = mongoose.model('users', user);


/**
 * Get webms by criteria
 * @param {Object} [params] - tags, lastSeqid
 * @param {Function} done
 */
function getWebms(params, done) {
    if (typeof params === 'function' && !done) {
        done = params;
        params = undefined;
    }

    var query = webms.find({seqid: {$exists: true}}, 'seqid file_info.path');
    if (params && params.lastSeqid) {
        query = query.find({seqid: {$lt: params.lastSeqid}});
    }

    if (params && params.tags) {
        query = query.find({tags: {$all: params.tags}});
    }

    query.sort({seqid: -1})
        .limit(config.webmsPerPage)
        .exec(function (err, webmsdb) {
            if (err) {
                done(err);
                return;
            }

            var webms = [];
            for (var i = 0; i < webmsdb.length; i++) {
                webms.push({
                    seqid: webmsdb[i].seqid,
                    previewSrc: url.resolve(config.videoServer, String(webmsdb[i].file_info.path).slice(2) + '.300x300.jpg')
                });
            }

            done(null, {
                webms: webms,
                lastSeqid: webms.length > 0 ? webms[webms.length - 1].seqid : params.lastSeqid
            });
        });
}


module.exports.webms = webms;
module.exports.tags = tags;
module.exports.maxwebmid = maxwebmid;
module.exports.getWebms = getWebms;
module.exports.users = users;