var url = require('url');
var mongoose = require('../libs/mongoose');
var config = require('../libs/config');
var cache = require('memory-cache');

var Schema = mongoose.Schema;

var webmSchema = new Schema({
    thread_id: Number,
    board: String,
    url: String,
    create_date: Date,
    file_info: Object,
    seqid: Number,
    tags: [String],
    time_wasted: Number,
    doubles: [Schema.Types.ObjectId]
});


/**
 * Get webms by criteria
 * @param {Object} params - tags, lastSeqid, hideDanger, page
 * @param {Function} done
 */
webmSchema.statics.getWebms = function (params, done) {
    var conditions = [];
    conditions.push({seqid: {$exists: true}});

    if (params && params.lastSeqid) {
        conditions.push({seqid: {$lt: params.lastSeqid}});
    }

    if (params && params.tags) {
        conditions.push({tags: {$all: params.tags}});
    }

    if (params && params.hideDanger) {
        conditions.push({tags: {$nin: ['danger']}});
    }

    var query = this.find({$and: conditions}, 'seqid file_info.path').sort({seqid: -1});

    if (params && params.page) {
        query = query.skip(config.get('webmsPerPage') * (params.page - 1));
    }

    query.limit(config.get('webmsPerPage'))
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


/**
 *
 * @param {Object} params - tags hideDanger
 * @param {Function} done
 * @return {Aggregate|Promise}
 */
webmSchema.statics.countByTags = function (params, done) {
    var conditions = [];
    conditions.push({"tags": {$exists: true}});
    conditions.push({seqid: {$exists: true}});

    if (params && params.tags) {
        conditions.push({tags: {$all: params.tags}});
    }

    if (params && params.hideDanger) {
        conditions.push({tags: {$nin: ['danger']}});
    }

    var operators = [
        {$match: {$and: conditions}},
        {$project: {_id: 0, tags: 1}},
        {$unwind: "$tags"},
        {$group: {_id: "$tags", count: {$sum: 1}}}
    ];

    var cachedData = cache.get(JSON.stringify(operators));
    if (cachedData) {
        done(null, cachedData);
        return;
    }

    return this.aggregate(operators).exec(function (err, data) {
        if (!err) {
            cache.put(JSON.stringify(operators), data, 1000 * 60);
        }

        done(err, data);
    });
};

/**
 * Get doubles by criteria
 * @param {Object} params - lastSeqid, page
 * @param {Function} done
 */
webmSchema.statics.getDoubles = function (params, done) {
    var conditions = [];
    conditions.push({doubles: {$exists: true, $not: {$size: 0}}});

    if (params && params.lastSeqid) {
        conditions.push({_id: {$lt: params.lastSeqid}});
    }

    var query = this.find({$and: conditions}, '_id file_info.path doubles').sort({_id: -1});

    if (params && params.page) {
        query = query.skip(config.get('webmsPerPage') * (params.page - 1));
    }

    query.limit(config.get('webmsPerPage'))
        .exec(function (err, webmsdb) {
            if (err) {
                done(err);
                return;
            }

            var webms = [];
            for (var i = 0; i < webmsdb.length; i++) {
                webms.push({
                    seqid: webmsdb[i]._id,
                    doubles: webmsdb[i].doubles,
                    previewSrc: url.resolve(config.get('videoServer'), String(webmsdb[i].file_info.path).slice(2) + '.300x300.jpg')
                });
            }

            done(null, {
                webms: webms,
                lastSeqid: webms.length > 0 ? webms[webms.length - 1].seqid : params.lastSeqid
            });
        });
};


var Webm = mongoose.model('Webm', webmSchema);


module.exports = Webm;