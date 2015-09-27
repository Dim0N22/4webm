var url = require('url');
var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');


router.get('/', function (req, res) {
    db.webms.aggregate([
        {$match: {"tags.1": {$exists: true}}},
        {$project: {_id: 0, tags: 1}},
        {$unwind: "$tags"},
        {$group: {_id: "$tags", count: {$sum: 1}}}
    ], function (err, tags) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }

        var params;
        if (req.cookies.tags) {
            var clientTags = JSON.parse(req.cookies.tags);

            if (clientTags.length > 0) {
                params = {tags: clientTags};
            }
        }

        db.getWebms(params, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).end();
                return;
            }

            res.render('index', {
                title: '4webm',
                tags: tags,
                webms: result.webms,
                lastSeqid: result.lastSeqid
            });
        });
    });
});


router.get('/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
        }
    }

    var prevIdPromise = db.webms.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = db.webms.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = db.webms.findOne({seqid: id}, null, {sort: {seqid: 1}}).exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('view', {
                    title: '4webm #' + id,
                    id: id,
                    videoSrc: url.resolve(config.videoServer, String(webm.file_info.path).slice(2)),
                    tags: webm.tags,
                    prevHref: '/' + prevId,
                    nextHref: '/' + nextId
                });
            }

            var webm = values[2];


            // if prev not found (actually for first webm)
            if (!values[0]) {
                conditions.seqid = {$exists: true};
                db.webms.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            }

            // if next not found (actually for last webm)
            if (!values[1]) {
                conditions.seqid = {$exists: true};
                db.webms.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (exeption) {
            console.log(exeption);
            res.status(500).end();
        });
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
        }
    }


    var prevIdPromise = db.webms.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = db.webms.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = db.webms.findOne({seqid: id}, null, {sort: {seqid: 1}}).exec();
    var tagsPromise = db.tags.find().exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise, tagsPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('edit', {
                    title: '4webm edit #' + id,
                    id: id,
                    videoSrc: url.resolve(config.videoServer, String(webm.file_info.path).slice(2)),
                    tags: tags,
                    prevHref: '/edit/' + prevId,
                    nextHref: '/edit/' + nextId
                });
            }

            var webm = values[2];
            var tags = values[3];

            if (webm.tags && webm.tags.length > 0) {
                for (var i = 0; i < tags.length; i++) {
                    for (var j = 0; j < webm.tags.length; j++) {
                        if (webm.tags[j] === tags[i].name) {
                            tags[i].enable = true;
                        }
                    }
                }
            }

            // if prev not found (actually for first webm)
            if (!values[0]) {
                conditions.seqid = {$exists: true};
                db.webms.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            }

            // if next not found (actually for last webm)
            if (!values[1]) {
                conditions.seqid = {$exists: true};
                db.webms.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (exeption) {
            console.log(exeption);
            res.status(500).end();
        });
});


router.get('/random', function (req, res) {
    var conditions = {seqid: {$exists: true}};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
        }
    }

    db.webms.count(conditions, function (err, count) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }

        var randomId = Math.round(Math.random() * (count - 1) + 1);
        db.webms.find(conditions, 'seqid')
            .skip(randomId - 1)
            .limit(1)
            .exec(function (err, webms) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }

                if (!webms || webms.length === 0) {
                    console.log('Not found random webm');
                    res.redirect('/');
                    return;
                }

                res.redirect('/' + webms[0].seqid);
            });
    });
});


module.exports = router;