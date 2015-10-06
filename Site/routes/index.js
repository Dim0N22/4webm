var url = require('url');
var express = require('express');
var Webm = require('../models/webm');
var Tag = require('../models/tag');
var config = require('../libs/config');
var log = require('../libs/log');

var router = express.Router();
router.use('/random', require('./random'));
router.use('/login', require('./login'));
router.use('/invite', require('./invite'));


router.get('/', function (req, res) {
    var params = {};
    if (req.tags) {
        params.tags = req.tags;
    }

    params.hideDanger = !req.user;

    Webm.countByTags(params, function (err, tags) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        if (req.query.lastSeqid) {
            params.lastSeqid = req.query.lastSeqid;
        }

        Webm.getWebms(params, function (err, result) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return;
            }

            res.render('index', {
                title: config.get('projectName'),
                tags: tags,
                webms: result.webms,
                lastSeqid: result.lastSeqid,
                authorized: Boolean(req.user),
                projectName: config.get('projectName')
            });
        });
    });
});


router.get('/page/:page([0-9]+)', function (req, res) {
    var page = Number(req.params.page);
    if (page < 2) {
        res.redirect('/');
        return;
    }

    var params = {};
    if (req.tags) {
        params.tags = req.tags;
    }

    params.hideDanger = !req.user;

    Webm.countByTags(params, function (err, tags) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        params.page = page;

        Webm.getWebms(params, function (err, result) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return;
            }

            res.render('index', {
                title: config.get('projectName'),
                tags: tags,
                webms: result.webms,
                lastSeqid: result.lastSeqid,
                authorized: Boolean(req.user),
                projectName: config.get('projectName')
            });
        });
    });
});


router.get('/:id([0-9]+)', function (req, res) {
    console.log('req.params.id', req.params.id);
    var id = Number(req.params.id);

    var conditions = {};
    if (req.tags) {
        conditions.tags = {$all: req.tags};
    }

    if (!req.user) {
        conditions = {$and: [conditions, {tags: {$nin: ['danger']}}]};
    }

    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({$and: [conditions, {seqid: id}]}, null, {sort: {seqid: 1}}).exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('view', {
                    title: config.get('projectName') + ' #' + id,
                    id: id,
                    videoSrc: url.resolve(config.get('videoServer'), String(webm.file_info.path).slice(2)),
                    tags: webm.tags,
                    prevHref: '/' + prevId,
                    nextHref: '/' + nextId,
                    authorized: Boolean(req.user),
                    projectName: config.get('projectName')
                });
            }

            var webm = values[2];
            if (!webm) {
                res.redirect('/');
                return;
            }

            if (!values[0] && !values[1]) { // one webm on this criteria
                response(id, id);
                return;
            } else if (!values[0]) { // if prev not found (actually for first webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            } else if (!values[1]) { // if next not found (actually for last webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (err) {
            log.error(err);
            res.status(500).end();
        });
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.tags) {
        conditions.tags = {$all: req.tags};
    }

    if (!req.user) {
        conditions = {$and: [conditions, {tags: {$nin: ['danger']}}]};
    }

    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({seqid: id}, null, {sort: {seqid: 1}}).exec();
    var tagsPromise = Tag.find().select('name').exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise, tagsPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('edit', {
                    title: config.get('projectName') + ' edit #' + id,
                    id: id,
                    videoSrc: url.resolve(config.get('videoServer'), String(webm.file_info.path).slice(2)),
                    tags: tags,
                    prevHref: '/edit/' + prevId,
                    nextHref: '/edit/' + nextId,
                    danger: danger,
                    projectName: config.get('projectName')
                });
            }

            var webm = values[2];
            var tags = values[3];

            if (!webm) {
                res.redirect('/');
                return;
            }

            var danger = false;
            for (var k = 0; k < webm.tags.length; k++) {
                if (webm.tags[k] === 'danger') {
                    danger = true;
                    break;
                }
            }

            if (webm.tags && webm.tags.length > 0) {
                for (var i = 0; i < tags.length; i++) {
                    for (var j = 0; j < webm.tags.length; j++) {
                        if (webm.tags[j] === tags[i].name) {
                            tags[i].enable = true;
                            break;
                        }
                    }
                }
            }

            if (!values[0] && !values[1]) { // one webm on this criteria
                response(id, id);
                return;
            } else if (!values[0]) { // if prev not found (actually for first webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            } else if (!values[1]) { // if next not found (actually for last webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (err) {
            log.error(err);
            res.status(500).end();
        });
});


module.exports = router;
