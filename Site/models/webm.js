var url = require('url');
var mongoose = require('mongoose');
var config = require('../libs/config');

var Schema = mongoose.Schema;

var webmSchema = new Schema({
    thread_id: Number,
    board: String,
    url: String,
    create_date: Date,
    file_info: Object,
    seqid: Number,
    tags: [String]
});


/**
 * Get webms by criteria
 * @param {Object} params - tags, lastSeqid
 * @param {Function} done
 */
webmSchema.statics.getWebms = function (params, done) {
    var query = this.find({seqid: {$exists: true}}, 'seqid file_info.path');
    if (params && params.lastSeqid) {
        query = query.find({seqid: {$lt: params.lastSeqid}});
    }

    if (params && params.tags) {
        query = query.find({tags: {$all: params.tags}});
    }

    query.sort({seqid: -1})
        .limit(config.get('webmsPerPage'))
        .exec(function (err, webmsdb) {
            if (err) {
                done(err);
                return;
            }

            var webms = [];
            for (var i = 0; i < webmsdb.length; i++) {
                webms.push({
                    seqid: webmsdb[i].seqid,
                    previewSrc: url.resolve(config.get('videoServer'), String(webmsdb[i].file_info.path).slice(2) + '.300x300.jpg')
                });
            }

            done(null, {
                webms: webms,
                lastSeqid: webms.length > 0 ? webms[webms.length - 1].seqid : params.lastSeqid
            });
        });
};


webmSchema.statics.countByTags = function (cb) {
    return this.aggregate([
        {$match: {"tags": {$exists: true}}},
        {$project: {_id: 0, tags: 1}},
        {$unwind: "$tags"},
        {$group: {_id: "$tags", count: {$sum: 1}}}
    ], cb);
};


var Webm = mongoose.model('Webm', webmSchema);


module.exports = Webm;