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

        db.webms.find({seqid: {$exists: true}}, 'seqid file_info.path')
            .sort({seqid: -1})
            .limit(config.webmsPerPage)
            .exec(function (err, webmsdb) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }

                var webms = [];
                for (var i = 0; i < webmsdb.length; i++) {
                    webms.push({
                        seqid: webmsdb[i].seqid,
                        previewSrc: url.resolve(config.videoServer, String(webmsdb[i].file_info.path).slice(2) + '.300x300.jpg')
                    });
                }

                res.render('index', {
                    title: '4webm',
                    tags: tags,
                    webms: webms
                });
            });
    });
});


router.get('/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    db.webms.findOne({seqid: id}, function (err, webm) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }

        if (!webm) {
            res.redirect('/');
            return;
        }

        db.maxwebmid.findOne(function (err, item) {
            if (err) {
                console.log(err);
                res.status(500).end();
                return;
            }

            res.render('view', {
                title: '4webm #' + id,
                id: id,
                videoSrc: url.resolve(config.videoServer, String(webm.file_info.path).slice(2)),
                tags: webm.tags,
                prevHref: id > 1 ? '/' + (id - 1) : '/' + item.currentId,
                nextHref: id < item.currentId ? '/' + (id + 1) : '/1'
            });
        });
    });
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    db.webms.findOne({seqid: id}, function (err, webm) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }

        if (!webm) {
            res.redirect('/');
            return;
        }

        db.tags.find(function (err, tags) {
            if (err) {
                console.log(err);
                res.status(500).end();
                return;
            }

            if (webm.tags && webm.tags.length > 0) {
                for (var i = 0; i < tags.length; i++) {
                    for (var j = 0; j < webm.tags.length; j++) {
                        if (webm.tags[j] === tags[i].name) {
                            tags[i].enable = true;
                        }
                    }
                }
            }

            db.maxwebmid.findOne(function (err, item) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                res.render('edit', {
                    title: '4webm edit #' + id,
                    id: id,
                    videoSrc: url.resolve(config.videoServer, String(webm.file_info.path).slice(2)),
                    tags: tags,
                    prevHref: id > 1 ? '/edit/' + (id - 1) : '/edit/' + item.currentId,
                    nextHref: id < item.currentId ? '/edit/' + (id + 1) : '/edit/1'
                });
            });
        });
    });
});


router.get('/random', function (req, res) {
    db.maxwebmid.findOne(function (err, item) {
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }

        var randomId = Math.round(Math.random() * (item.currentId - 1) + 1);
        db.webms.findOne({seqid: {$gte: randomId}}, function (err, webm) {
            if (err) {
                console.log(err);
                res.status(500).end();
                return;
            }

            if (!webm) {
                console.log('Not found random webm');
                res.status(500).end();
                return;
            }

            res.redirect('/' + webm.seqid);
        })
    });
});


module.exports = router;